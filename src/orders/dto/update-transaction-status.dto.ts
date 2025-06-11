import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SettlementStatus, TransactionStatus } from '../entities/order.entity';

export class UpdateTransactionStatusDto {
  @ApiProperty({ enum: TransactionStatus, description: 'New status of the transaction' })
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;

  @ApiProperty({ description: 'Settlement status of the transaction' })
  @IsEnum(SettlementStatus)
  @IsNotEmpty()
  settlement_status: SettlementStatus;

  @ApiProperty({ description: 'Application code of the transaction' })
  application_code: string;
} 