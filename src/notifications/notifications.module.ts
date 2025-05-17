import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { PubSubService } from './pub-sub.service';

@Module({
  imports: [ConfigModule],
  providers: [NotificationsService, PubSubService],
  exports: [NotificationsService, PubSubService],
})
export class NotificationsModule {} 