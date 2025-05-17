import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PaymentEventDto } from './dto/payment-event.dto';
import { PaymentClosedDto } from './dto/payment-closed.dto';
import { GetPaymentConfigDto } from './dto/get-payment-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('payment')
@Controller('payment')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class PaymentController {
  constructor(private svc: PaymentService) {}

  @Get('config/:orderId')
  @Roles('parent', 'admin')
  @ApiOperation({ summary: 'Get payment configuration for an order' })
  @ApiResponse({ status: 200, description: 'Payment configuration retrieved successfully', type: GetPaymentConfigDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getConfig(@Param('orderId') orderId: string): Promise<GetPaymentConfigDto> {
    return await this.svc.getConfig(orderId);
  }

  @Post('success')
  @Roles('admin')
  @ApiOperation({ summary: 'Handle successful payment' })
  @ApiResponse({ status: 200, description: 'Payment marked as successful' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async success(@Body() evt: PaymentEventDto) {
    return await this.svc.markPaid(evt);
  }

  @Post('error')
  @Roles('admin')
  @ApiOperation({ summary: 'Handle failed payment' })
  @ApiResponse({ status: 200, description: 'Payment marked as failed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async error(@Body() evt: PaymentEventDto) {
    return await this.svc.markFailed(evt);
  }

  @Post('closed')
  @Roles('admin')
  @ApiOperation({ summary: 'Handle closed payment' })
  @ApiResponse({ status: 200, description: 'Payment marked as closed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async closed(@Body() evt: PaymentClosedDto) {
    return await this.svc.markClosed(evt);
  }
} 