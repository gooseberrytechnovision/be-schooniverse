import { Feedback } from '../entities/feedback.entity';

export class FeedbackStatusUpdatedEvent {
  constructor(public readonly feedback: Feedback) {}
} 