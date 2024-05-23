import { ConnectionGateway } from '@connection/connection.gateway';
import { Module } from '@nestjs/common';
import { Minio } from '@setting/minio/minio';
import { IoRedis } from '@setting/redis/ioredis';
import { MediaLibraryProcessor } from './media-library.processor';
import { UploadMediaFactory } from './upload-media/_upload-media.factory';
import { UploadImage } from './upload-media/upload-image';
import { UploadVideo } from './upload-media/upload-video';

@Module({
  controllers: [],
  providers: [MediaLibraryProcessor, Minio, IoRedis, UploadMediaFactory, UploadImage, UploadVideo, ConnectionGateway],
})
export class QueueModule {}
