import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MEDIA_LIBRARY_QUEUE } from '@queue/enums/media-library.enum';
import { IoRedis } from '@setting/redis/ioredis';
import { MediaLibraryEntity } from './entities/media-library.entity';
import { MediaLibraryController } from './media-library.controller';
import { MediaLibraryService } from './media-library.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MEDIA_LIBRARY_QUEUE.NAME,
    }),

    TypeOrmModule.forFeature([MediaLibraryEntity]),
  ],
  controllers: [MediaLibraryController],
  providers: [MediaLibraryService, IoRedis],
})
export class MediaLibraryModule {}
