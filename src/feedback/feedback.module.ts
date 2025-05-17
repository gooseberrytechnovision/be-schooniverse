import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './entities/feedback.entity';
import { Parent } from '../parents/entities/parent.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PubSubModule } from '../notifications/pub-sub.module';
import { FeedbackListenerService } from './listeners/feedback-listener.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, Parent]),
    EventEmitterModule.forRoot(),
    NotificationsModule,
    PubSubModule
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackListenerService],
  exports: [FeedbackService],
})
export class FeedbackModule {} 