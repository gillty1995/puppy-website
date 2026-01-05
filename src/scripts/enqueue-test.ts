import IORedis from 'ioredis';
import { Queue } from 'bullmq';

(async function main(){
  const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  const q = new Queue(process.env.IMAGE_QUEUE_NAME || 'image-processing', { connection });
  await q.add('test', { postId: 'test123', files: ['/uploads/1745347305879-fenton-field.png'] });
  console.log('enqueued');
  process.exit(0);
})();
