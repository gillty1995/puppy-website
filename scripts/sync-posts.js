#!/usr/bin/env node

if (process.env.NODE_ENV !== "production") {
  console.log("⚡️ sync-posts skipped (not in production)");
  process.exit(0);
}

import fs from "fs/promises";
import path from "path";

const ORIGIN = "https://textilepoms.com";
const API_URL = `${ORIGIN}/api/posts`;
const OUT_JSON = path.join(process.cwd(), "src/data/posts.json");
const UPLOADS = path.join(process.cwd(), "public/uploads");

function withLeadingSlash(value) {
  return value.startsWith("/") ? value : `/${value}`;
}

function deriveLocalRelativePath(value) {
  const pathname = /^https?:\/\//.test(value) ? new URL(value).pathname : value;
  return pathname
    .replace(/^\/?uploads\//, "")
    .replace(/^\/+/, "");
}

async function fetchImageWithFallback(imgPath) {
  const pathCandidates = [
    imgPath,
    imgPath.replace(/(\.\w+)(?:\1)+$/, "$1"),
    imgPath.replace(/\.\w+$/, ""),
  ];
  const candidates = pathCandidates.map((candidate) =>
    /^https?:\/\//.test(candidate) ? candidate : `${ORIGIN}${withLeadingSlash(candidate)}`
  );

  for (const candidate of candidates) {
    const resp = await fetch(candidate);
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      return { buffer: buf, finalPath: candidate, localRelativePath: deriveLocalRelativePath(candidate) };
    }
  }

  throw new Error(
    `all fetches failed: ${candidates.join(", ")}`
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
        const { buffer, finalPath, localRelativePath } = await fetchImageWithFallback(imgPath);
        const localFile = path.join(UPLOADS, localRelativePath);
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
