const fs = require("fs").promises;
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const POSTS_FILE = path.join(process.cwd(), "src", "data", "posts.json");

function usage() {
  console.log(`Usage: node scripts/migrate-uploads-to-s3.js [--apply] [--rewrite-posts] [--delete-local]

Options:
  --apply         : actually perform uploads (default is dry-run)
  --rewrite-posts : after upload, rewrite src/data/posts.json image references to S3 URLs
  --delete-local  : delete local files after successful upload (requires --apply)
`);
}

function mimeFromExt(name) {
  const ext = (path.extname(name) || "").toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await listFiles(full);
      files.push(...sub);
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return usage();
  const DO_APPLY = args.includes("--apply");
  const DO_REWRITE = args.includes("--rewrite-posts");
  const DO_DELETE = args.includes("--delete-local");

  const S3_BUCKET = process.env.S3_BUCKET || "";
  const S3_REGION =
    process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
  const S3_PREFIX = (process.env.S3_PREFIX || "").replace(/^\/+|\/+$/g, ""); // trim slashes

  if (!S3_BUCKET) {
    console.error("S3_BUCKET not set in env. Set S3_BUCKET and re-run.");
    process.exit(2);
  }

  console.log("Migration configuration:");
  console.log("  S3_BUCKET=", S3_BUCKET);
  console.log("  S3_REGION=", S3_REGION);
  console.log("  S3_PREFIX=", S3_PREFIX || "(none)");
  console.log("  UPLOADS_DIR=", UPLOADS_DIR);
  console.log("  POSTS_FILE=", POSTS_FILE);
  console.log("  DRY-RUN=", !DO_APPLY);
  console.log("  REWRITE_POSTS=", DO_REWRITE);
  console.log("  DELETE_LOCAL_AFTER_UPLOAD=", DO_DELETE);

  let files = [];
  try {
    files = await listFiles(UPLOADS_DIR);
  } catch (err) {
    console.error("failed to list uploads dir:", err.message || err);
    process.exit(1);
  }

  if (!files.length) {
    console.log("No files found in", UPLOADS_DIR);
    process.exit(0);
  }

  const s3 = new S3Client({ region: S3_REGION });

  const plan = files.map((f) => {
    const rel = path.relative(UPLOADS_DIR, f).split(path.sep).join("/");
    const key = (S3_PREFIX ? S3_PREFIX + "/" : "") + `uploads/${rel}`;
    const url =
      `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${encodeURIComponent(
        key
      )}`.replace(/%2F/g, "/");
    return { file: f, rel, key, url };
  });

  console.log("\nPlanned uploads:");
  for (const p of plan) console.log("  ", p.rel, "->", p.key);

  if (!DO_APPLY) {
    console.log(
      "\nDRY RUN: no uploads performed. Re-run with --apply to perform uploads."
    );
    process.exit(0);
  }

  // perform uploads
  const uploaded = [];
  for (const p of plan) {
    try {
      const body = await fs.readFile(p.file);
      const contentType = mimeFromExt(p.file);
      const cmd = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: p.key,
        Body: body,
        ContentType: contentType,
      });
      await s3.send(cmd);
      console.log("uploaded", p.rel, "->", p.key);
      uploaded.push(p);
    } catch (err) {
      console.error("failed to upload", p.rel, err);
    }
  }

  if (DO_REWRITE) {
    // load posts.json and rewrite image paths
    try {
      const raw = await fs.readFile(POSTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("posts.json is not an array");
      const updated = parsed.map((post) => {
        if (!post || !post.images) return post;
        const imgs = post.images.map((img) => {
          // if already an https S3 URL, leave
          if (typeof img === "string" && img.startsWith("http")) return img;
          // handle leading /uploads/... or uploads/... or filename
          const imgStr = String(img || "");
          const base = imgStr
            .replace(/^\/+/, "")
            .replace(/^uploads\//, "")
            .split("?")[0]
            .split("#")[0];
          const p = uploaded.find(
            (u) => u.rel === base || u.rel === imgStr.replace(/^uploads\//, "")
          );
          if (p) return p.url;
          // not found: return original
          return img;
        });
        return { ...post, images: imgs };
      });
      await fs.writeFile(POSTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
      console.log("rewrote", POSTS_FILE, "with S3 URLs for uploaded images");
    } catch (err) {
      console.error("failed to rewrite posts.json:", err);
    }
  }

  if (DO_DELETE) {
    for (const u of uploaded) {
      try {
        await fs.unlink(u.file);
        console.log("deleted local", u.rel);
      } catch (err) {
        console.error("failed to delete local file", u.rel, err);
      }
    }
  }

  console.log("\nMigration complete. Uploaded", uploaded.length, "files.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
