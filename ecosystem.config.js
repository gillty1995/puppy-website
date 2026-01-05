module.exports = {
  apps: [
    {
      name: "textilepoms",
      script: "npm",
      args: "start",
      cwd: process.cwd(),
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "image-worker",
      script: "node",
      args: "dist/workers/imageProcessor.js",
      cwd: process.cwd(),
      env: {
        NODE_ENV: "production",
        REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
        S3_BUCKET: process.env.S3_BUCKET || "",
        AWS_REGION:
          process.env.AWS_REGION || process.env.S3_REGION || "us-east-1",
        S3_PREFIX: process.env.S3_PREFIX || "",
        IMAGE_QUEUE_NAME: process.env.IMAGE_QUEUE_NAME || "image-processing",
        UPLOADS_DIR: process.env.UPLOADS_DIR || undefined,
        VARIANTS_DIR: process.env.VARIANTS_DIR || undefined,
        WORKER_CONCURRENCY: process.env.WORKER_CONCURRENCY || undefined,
      },
    },
  ],
};
