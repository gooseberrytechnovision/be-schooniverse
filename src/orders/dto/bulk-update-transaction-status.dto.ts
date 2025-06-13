import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTransactionStatusDto } from './update-transaction-status.dto';

export class BulkTransactionItem extends UpdateTransactionStatusDto {
  @ApiProperty({ description: 'ID of the order' })
  @IsNotEmpty()
  orderId: string;
}

export class BulkUpdateTransactionStatusDto {
  @ApiProperty({ type: [BulkTransactionItem], description: 'Array of transaction updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkTransactionItem)
  transactions: BulkTransactionItem[];
} 