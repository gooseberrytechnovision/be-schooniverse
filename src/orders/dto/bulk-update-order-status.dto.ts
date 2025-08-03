import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './update-order-status.dto';

export class BulkOrderItem extends UpdateOrderStatusDto {
  @ApiProperty({ description: 'ID of the order' })
  @IsNotEmpty()
  orderId: string;
}

export class BulkUpdateOrderStatusDto {
  @ApiProperty({ type: [BulkOrderItem], description: 'Array of order status updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkOrderItem)
  transactions: BulkOrderItem[];
} 