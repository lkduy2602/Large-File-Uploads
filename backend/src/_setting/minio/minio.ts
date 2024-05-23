import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class Minio extends Client {
  constructor() {
    super({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESSKEY,
      secretKey: process.env.MINIO_SECRETKEY,
    });
  }
}
