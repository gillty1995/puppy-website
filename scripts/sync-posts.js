#!/usr/bin/env node

if (process.env.NODE_ENV !== "production") {
  console.log("⚡️ sync-posts skipped (not in production)");
  process.exit(0);
}

const fs = require("fs/promises");
const path = require("path");

const ORIGIN = "https://textilepoms.com";
const API_URL = `${ORIGIN}/api/posts`;
const OUT_JSON = path.join(process.cwd(), "src/data/posts.json");
const UPLOADS = path.join(process.cwd(), "public/uploads");

async function fetchImageWithFallback(imgPath) {
  // build a small list of candidate paths
  const candidates = [
    imgPath,
    // collapse duplicate extensions: foo.jpg.jpg → foo.jpg
    imgPath.replace(/(\.\w+)(?:\1)+$/, "$1"),
    // strip final extension entirely: foo.png → foo
    imgPath.replace(/\.\w+$/, ""),
  ];

  for (const candidate of candidates) {
    const url = ORIGIN + candidate;
    const resp = await fetch(url);
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      return { buffer: buf, finalPath: candidate };
    }
  }

  throw new Error(
    `all fetches failed: ${candidates.map((c) => ORIGIN + c).join(", ")}`
  );
}

async function syncPosts() {
  // 1) JSON
  const postsRes = await fetch(API_URL);
  if (!postsRes.ok) throw new Error(`Posts fetch failed: ${postsRes.status}`);
  const posts = await postsRes.json();

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(posts, null, 2));
  console.log(`✅ Synced ${posts.length} posts`);

  // 2) images
  const allImgs = posts.flatMap((p) => p.images);
  await Promise.all(
    allImgs.map(async (imgPath) => {
      try {
        const { buffer, finalPath } = await fetchImageWithFallback(imgPath);
        const localFile = path.join(
          UPLOADS,
          finalPath.replace(/^\/uploads\//, "")
        );
        await fs.mkdir(path.dirname(localFile), { recursive: true });
        await fs.writeFile(localFile, buffer);
        console.log(`   ↳ downloaded ${finalPath}`);
      } catch (err) {
        console.warn(`⚠️ skipped ${imgPath}: ${err.message}`);
      }
    })
  );
}

syncPosts().catch((err) => {
  console.error(err);
  process.exit(1);
});
