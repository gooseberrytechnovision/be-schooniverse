import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'New status of the order' })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({ description: 'Tracking ID of the order' })
  trackingId: string;
} 