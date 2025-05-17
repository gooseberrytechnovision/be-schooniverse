import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PubSubService } from './pub-sub.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {} 