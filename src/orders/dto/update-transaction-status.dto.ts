import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../entities/order.entity';

export class UpdateTransactionStatusDto {
  @ApiProperty({ enum: TransactionStatus, description: 'New status of the transaction' })
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;
} 