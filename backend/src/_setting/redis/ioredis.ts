import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class IoRedis extends Redis {
  constructor() {
    super(
      `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
    );
  }
}
