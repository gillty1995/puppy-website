import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import convert from "heic-convert";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
const S3_PREFIX = (process.env.S3_PREFIX || "").replace(/^\/|\/$/g, "");
const s3Client = S3_BUCKET ? new S3Client({ region: S3_REGION }) : null;

async function ensureUploadsDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

async function processImageBuffer(file: File): Promise<Buffer> {
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const isHeic =
    /\.heic$/i.test(file.name) ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  try {
    if (isHeic) {
      const jpegBuf = await convert({
        buffer: rawBuffer as unknown as ArrayBufferLike,
        format: "JPEG",
        quality: 0.8,
      });

      return await sharp(Buffer.from(jpegBuf as Uint8Array), {
        limitInputPixels: false,
      })
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
    }

    return await sharp(rawBuffer, { limitInputPixels: false })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch (err) {
    console.error("Puppy image processing failed, falling back to original:", err);
    return rawBuffer;
  }
}

export async function storePuppyImage(file: File): Promise<string> {
  const uploadDir = await ensureUploadsDir();
  const processedBuffer = await processImageBuffer(file);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}.jpg`;
  const storedPath = `uploads/${filename}`;

  if (s3Client && S3_BUCKET) {
    const key = `${S3_PREFIX ? `${S3_PREFIX}/` : ""}${storedPath}`;
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: processedBuffer,
          ContentType: "image/jpeg",
        })
      );
      try {
        await fs.writeFile(path.join(uploadDir, filename), processedBuffer);
      } catch (err) {
        console.warn("Puppy image local mirror failed:", err);
      }
      return storedPath;
    } catch (err) {
      console.error("Puppy image upload to S3 failed, falling back to local write:", err);
    }
  }

  const dest = path.join(uploadDir, filename);
  await fs.writeFile(dest, processedBuffer);
  return storedPath;
}
