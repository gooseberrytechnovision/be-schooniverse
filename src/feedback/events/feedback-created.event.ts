import { Feedback } from '../entities/feedback.entity';

export class FeedbackCreatedEvent {
  constructor(public readonly feedback: Feedback) {}
} 