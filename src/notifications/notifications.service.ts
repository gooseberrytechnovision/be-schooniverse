import { Injectable, OnModuleInit } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(private readonly pubSubService: PubSubService) {}

  async onModuleInit() {
    // Subscribe to feedback events
    await this.pubSubService.subscribe('feedback:created', (payload) => {
      console.log('New feedback received:', payload);
      // Implement notification logic here
      // For example: send email, SMS, or push notification
    });

    await this.pubSubService.subscribe('feedback:status:updated', (payload) => {
      console.log('Feedback status updated:', payload);
      // Implement notification logic here
      // For example: notify parent about status change
    });
  }
} 