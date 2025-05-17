import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

type EventCallback = (...args: any[]) => void;

@Injectable()
export class PubSubService {
  private subscribers: Map<string, EventCallback[]> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  async publish(event: string, data: any) {
    console.log('Publishing event:', event, data);
    this.eventEmitter.emit(event, data);
  }

  async subscribe(event: string, callback: EventCallback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    this.eventEmitter.on(event, callback);
  }

  async unsubscribe(event: string, callback: EventCallback) {
    if (this.subscribers.has(event)) {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        this.eventEmitter.off(event, callback);
      }
    }
  }
} 