import { MEDIA_LIBRARY_TYPE } from '@media-library/enums/media-library.enum';
import { Injectable } from '@nestjs/common';
import { UploadImage } from './upload-image';
import { UploadMediaStrategy } from './_upload-media.strategy';
import { UploadVideo } from './upload-video';

@Injectable()
export class UploadMediaFactory {
  constructor(private readonly uploadImage: UploadImage, private readonly uploadVideo: UploadVideo) {}

  async createStrategy(type: MEDIA_LIBRARY_TYPE, bucket: string, link: string, chunks: string[]) {
    const strategyMap = new Map<MEDIA_LIBRARY_TYPE, UploadMediaStrategy>();
    strategyMap.set(MEDIA_LIBRARY_TYPE.IMAGE, this.uploadImage);
    strategyMap.set(MEDIA_LIBRARY_TYPE.VIDEO, this.uploadVideo);

    const strategy = strategyMap.get(type);
    if (!strategy) return;

    await strategy.upload(bucket, link, chunks);
  }
}
