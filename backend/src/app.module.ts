import { Module } from '@nestjs/common';
import { SettingModule } from './_setting/_setting.module';
import { MediaLibraryModule } from './media-library/media-library.module';
import { QueueModule } from './queue/queue.module';
import { ConnectionModule } from './connection/connection.module';

@Module({
  imports: [SettingModule, MediaLibraryModule, QueueModule, ConnectionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
