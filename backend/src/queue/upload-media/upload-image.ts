import { Injectable } from '@nestjs/common';
import { UploadMediaStrategy } from './_upload-media.strategy';

@Injectable()
export class UploadImage implements UploadMediaStrategy {
  async upload(bucket: string, link: string, chunks: string[]): Promise<void> {}
}
