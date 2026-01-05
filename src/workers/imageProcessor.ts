import path from 'path';
import fs from 'fs/promises';
import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { readPosts, writePosts } from '../data/posts.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const QUEUE_NAME = process.env.IMAGE_QUEUE_NAME || 'image-processing';
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
const VARIANTS_DIR = process.env.VARIANTS_DIR || path.join(UPLOADS_DIR, 'variants');
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);

// S3 config
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
const S3_PREFIX = process.env.S3_PREFIX || '';
const s3Client = S3_BUCKET ? new S3Client({ region: S3_REGION }) : null;

async function ensureDir(dir: string) {
  try { await fs.mkdir(dir, { recursive: true }); } catch { /* ignore */ }
}

async function downloadS3ToTemp(keyOrUrl: string) {
  let key = keyOrUrl;
  if (keyOrUrl.startsWith('https://')) {
    const parts = keyOrUrl.split('.amazonaws.com/');
    key = parts[1] || keyOrUrl;
  }
  if (!s3Client || !S3_BUCKET) throw new Error('S3 not configured');
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: decodeURIComponent(key) });
  const resp = await s3Client.send(cmd);
  const stream = resp.Body as unknown as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function uploadFileToS3(localPath: string, key: string) {
  if (!s3Client || !S3_BUCKET) throw new Error('S3 not configured');
  const body = await fs.readFile(localPath);
  const cmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: 'image/webp' });
  await s3Client.send(cmd);
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${encodedKey}`;
}

async function genVariantsFromBuffer(buffer: Buffer, base: string) {
  const out400 = path.join(VARIANTS_DIR, `${base}-400.webp`);
  const out1200 = path.join(VARIANTS_DIR, `${base}-1200.webp`);
  await ensureDir(VARIANTS_DIR);
  try {
    await sharp(buffer).rotate().resize({ width: 400 }).webp({ quality: 80 }).toFile(out400);
    await sharp(buffer).rotate().resize({ width: 1200 }).webp({ quality: 80 }).toFile(out1200);
    return { out400, out1200 };
  } catch (err) {
    console.error('variant generation failed for buffer', err);
    throw err;
  }
}

async function processor(job: Job) {
  const data = job.data as { postId: string; files: string[] };
  const postId = data?.postId;
  const files = data?.files || [];
  if (postId) console.log('processing post', postId);
  await ensureDir(VARIANTS_DIR);
  const results: Array<{ src: string; out400: string; out1200: string }> = [];
  for (const f of files) {
    try {
      let buffer: Buffer;
      let baseName = path.basename(f).split('?')[0].split('#')[0];
      if (f.startsWith('http://') || f.startsWith('https://')) {
        buffer = await downloadS3ToTemp(f);
      } else if (f.startsWith('/uploads/') || !f.includes('://')) {
        const localPath = f.startsWith('/') ? path.join(process.cwd(), 'public', f) : path.join(UPLOADS_DIR, path.basename(f));
        buffer = await fs.readFile(localPath);
      } else {
        const resp = await fetch(f);
        if (!resp.ok) throw new Error('fetch failed');
        buffer = Buffer.from(await resp.arrayBuffer());
      }
      baseName = path.basename(baseName, path.extname(baseName));
      const { out400, out1200 } = await genVariantsFromBuffer(buffer, baseName);
      results.push({ src: f, out400, out1200 });
    } catch (err) {
      console.error('processing error for', f, err);
    }
  }

  try {
    const posts = await readPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      const post = posts[idx];
      post.variants = post.variants || {};

      for (const r of results) {
        const base = path.basename(r.src, path.extname(r.src));

        if (S3_BUCKET) {
          try {
            const key400 = path.posix.join(S3_PREFIX, 'variants', path.basename(r.out400));
            const key1200 = path.posix.join(S3_PREFIX, 'variants', path.basename(r.out1200));
            await uploadFileToS3(r.out400, key400);
            await uploadFileToS3(r.out1200, key1200);
            (post.variants as Record<string, { thumb: string; large: string }>)[base] = { thumb: key400, large: key1200 };
            try { await fs.unlink(r.out400); } catch { /* ignore */ }
            try { await fs.unlink(r.out1200); } catch { /* ignore */ }
          } catch (err) {
            console.error('failed to upload variants to S3 for', r.src, err);
            const rel400 = '/' + path.relative(path.join(process.cwd(), 'public'), r.out400).replace(/\\/g, '/');
            const rel1200 = '/' + path.relative(path.join(process.cwd(), 'public'), r.out1200).replace(/\\/g, '/');
            (post.variants as Record<string, { thumb: string; large: string }>)[base] = { thumb: rel400, large: rel1200 };
          }
        } else {
          const rel400 = '/' + path.relative(path.join(process.cwd(), 'public'), r.out400).replace(/\\/g, '/');
          const rel1200 = '/' + path.relative(path.join(process.cwd(), 'public'), r.out1200).replace(/\\/g, '/');
          (post.variants as Record<string, { thumb: string; large: string }>)[base] = { thumb: rel400, large: rel1200 };
        }
      }

      posts[idx] = post;
      await writePosts(posts);
      console.log('updated posts.json with variants for post', postId);
    }
  } catch (err) {
    console.error('failed to update posts.json with variants', err);
  }
  return { processed: results.length };
}

const worker = new Worker(QUEUE_NAME, processor, { connection, concurrency: CONCURRENCY });

worker.on('completed', job => console.log('image job completed', job.id, job.returnvalue));
worker.on('failed', (job, err) => console.error('image job failed', job?.id, err));

process.on('SIGINT', async () => { console.log('shutting down worker'); await worker.close(); process.exit(0); });
process.on('SIGTERM', async () => { console.log('shutting down worker'); await worker.close(); process.exit(0); });
