import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MEDIA_LIBRARY_QUEUE } from '@queue/enums/media-library.enum';
import { IoRedis } from '@setting/redis/ioredis';
import { REDIS_KEY } from '@utils/redis/key.redis';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { CreateMediaLibraryDto } from './dto/create-media-library.dto';
import { UploadMediaLibraryDto } from './dto/upload-media-library.dto';
import { MediaLibraryEntity } from './entities/media-library.entity';
import { CreateMediaLibraryResponse } from './response/create-media-library.response';
import { MEDIA_LIBRARY_TYPE } from './enums/media-library.enum';
import { createHash } from 'crypto';

@Injectable()
export class MediaLibraryService {
  MILLISECONDS_FROM_HOUR = 12 * 3600000;

  constructor(
    @InjectRepository(MediaLibraryEntity)
    private readonly mediaLibraryRepository: Repository<MediaLibraryEntity>,

    @InjectQueue(MEDIA_LIBRARY_QUEUE.NAME)
    private readonly mediaLibraryQueue: Queue,

    private readonly redis: IoRedis,
  ) {}

  async createMediaLibrary(body: CreateMediaLibraryDto) {
    const { name, size, type } = body;
    const link = this.generateLink(name, type);

    const mediaLibrary = this.mediaLibraryRepository.create({
      name: name,
      size: size,
      type: type,
      bucket: process.env.MINIO_BUCKET,
      link: link,
    });
    await this.mediaLibraryRepository.save(mediaLibrary);

    return new CreateMediaLibraryResponse(mediaLibrary);
  }

  private generateLink(name: string, type: MEDIA_LIBRARY_TYPE) {
    const timestamp = performance.timeOrigin + performance.now();

    switch (type) {
      case MEDIA_LIBRARY_TYPE.IMAGE:
        break;
      case MEDIA_LIBRARY_TYPE.VIDEO:
        break;
      default:
        throw new HttpException('type not found!', HttpStatus.BAD_REQUEST);
    }

    const hashedName = createHash('md5')
      .update(timestamp + '_' + type + '_' + name)
      .digest('hex');

    return hashedName;
  }

  async uploadMediaLibrary(file: Express.Multer.File, body: UploadMediaLibraryDto) {
    const { id, type, chunk_number, total_chunks } = body;

    await this.redis.set(
      REDIS_KEY.MEDIA_CHUNK(id, chunk_number),
      file.buffer.toString('base64'),
      'PX',
      this.MILLISECONDS_FROM_HOUR,
    );

    if (chunk_number == total_chunks - 1) {
      const mediaLibrary = await this.mediaLibraryRepository.findOne({
        select: ['id', 'bucket', 'link'],
        where: {
          id,
          type,
          is_upload: false,
        },
      });
      if (!mediaLibrary) {
        const keys = await this.redis.keys(REDIS_KEY.MEDIA_CHUNK(id, '*'));
        await this.redis.del(...keys);

        throw new HttpException('mediaLibrary not found', HttpStatus.NOT_FOUND);
      }

      await this.mediaLibraryQueue.add(
        MEDIA_LIBRARY_QUEUE.MERGE_CHUNKS,
        {
          id: id,
          type: type,
          bucket: mediaLibrary.bucket,
          link: mediaLibrary.link,
          total_chunks: total_chunks,
        },
        {
          attempts: 5,
        },
      );
    }
  }
}
