import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullConfigService } from './queue/queue';
import { TypeOrmConfigService } from './typeorm/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
  providers: [],
})
export class SettingModule {}
