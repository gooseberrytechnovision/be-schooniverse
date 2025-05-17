import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PaymentEventDto } from './dto/payment-event.dto';

@ApiTags('webhooks')
@Controller('webhooks/gq')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private svc: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Handle payment webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  async handle(@Body() body: any) {
    try {
      const { type, data } = body;
      this.logger.debug(`Webhook received: ${type}`, { data });

      if (!type || !data) {
        throw new HttpException('Invalid webhook payload', HttpStatus.BAD_REQUEST);
      }

      if (
        type === 'dt.payment.captured' ||
        (type === 'MONTHLY-EMI' && data.event === 'emi.form.submit')
      ) {
        this.logger.log(`Processing successful payment for order: ${data.order_code}`);
        return await this.svc.markPaid(data);
      }

      if (
        type === 'dt.payment.failed' ||
        (type === 'MONTHLY-EMI' && data.error)
      ) {
        this.logger.warn(`Processing failed payment for order: ${data.order_code}`);
        return await this.svc.markFailed(data);
      }

      this.logger.debug(`Unhandled webhook type: ${type}`);
      return { received: true };
    } catch (error) {
      this.logger.error('Error processing webhook:', error.stack);
      throw new HttpException(
        'Error processing webhook',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 