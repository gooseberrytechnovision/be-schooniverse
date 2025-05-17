import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PubSubService } from '../../notifications/pub-sub.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class FeedbackListenerService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(FeedbackListenerService.name);

  constructor(private readonly pubSubService: PubSubService) {
    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: 'joy237@gmail.com',
        pass: 'haeqmewietqdoxje',
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email configuration error:', error);
      } else {
        this.logger.log('Email server is ready to send messages');
      }
    });
  }

  async onModuleInit() {
    // Subscribe to feedback created events
    await this.pubSubService.subscribe('feedback:created', async (data) => {
      this.logger.log('Feedback created event received:', data);
      await this.handleFeedbackCreated(data);
    });
  }

  private async handleFeedbackCreated(data: any) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
        throw new Error('Email configuration is missing. Please check your environment variables.');
      }

      

      const mailOptions = {
        from: `"School Feedback System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Query Received',
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Feedback ID:</strong> ${data.id}</p>
          <p><strong>Parent Name:</strong> ${data.parent_name}</p>
          <p><strong>Query Type:</strong> ${data.query_type}</p>
          <p><strong>Student USID:</strong> ${data.student_usid}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Created At:</strong> ${new Date(data.created_at).toLocaleString()}</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('Feedback notification email sent successfully:', info.messageId);
    } catch (error) {
      this.logger.error('Error sending feedback notification email:', error);
      throw error; // Re-throw to handle it in the calling function
    }
  }
} 