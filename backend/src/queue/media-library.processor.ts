import { Process, Processor } from '@nestjs/bull';
import { IoRedis } from '@setting/redis/ioredis';
import { REDIS_KEY } from '@utils/redis/key.redis';
import { Job } from 'bull';
import { mkdirSync, rm } from 'fs';
import { MEDIA_LIBRARY_QUEUE } from './enums/media-library.enum';
import { MergeChunksDto } from './interface/merge-chunks.dto';
import { UploadMediaFactory } from './upload-media/_upload-media.factory';

@Processor(MEDIA_LIBRARY_QUEUE.NAME)
export class MediaLibraryProcessor {
  constructor(private readonly redis: IoRedis, private readonly uploadMediaFactory: UploadMediaFactory) {}

  @Process({
    name: MEDIA_LIBRARY_QUEUE.MERGE_CHUNKS,
    concurrency: 5,
  })
  async mergeChunks(job: Job<MergeChunksDto>) {
    const { id, type, bucket, link, total_chunks } = job.data;

    const folderPath = bucket + '/' + link;

    try {
      mkdirSync(folderPath);

      const keysMediaChunk = Array.from({ length: total_chunks }, (_, chunk_number) => {
        return REDIS_KEY.MEDIA_CHUNK(id, chunk_number);
      });

      const chunks = await this.redis.mget(keysMediaChunk);

      await this.uploadMediaFactory.createStrategy(type, bucket, link, chunks);

      this.deleteFolder(folderPath);
      await this.redis.del(...keysMediaChunk);
    } catch (error) {
      console.error(error);
      this.deleteFolder(folderPath);
      throw error;
    }
  }

  private deleteFolder(path: string) {
    rm(process.cwd() + '/' + path, { recursive: true }, err => {
      if (err) console.error(err);
    });
  }
}
