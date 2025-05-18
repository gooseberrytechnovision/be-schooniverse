import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentEventDto {
  @ApiProperty({ description: 'Order code/ID for the payment' })
  @IsString()
  order_code: string;

  @ApiPropertyOptional({ description: 'Bank reference ID for the payment' })
  @IsOptional()
  @IsString()
  bank_reference_id?: string;

  @ApiPropertyOptional({ description: 'Application code for the payment' })
  @IsOptional()
  @IsString()
  application_code?: string;

  @ApiPropertyOptional({ description: 'Timestamp of the transaction' })
  @IsOptional()
  @IsString()
  transaction_timestamp?: string;

  @ApiPropertyOptional({ description: 'Error details if payment failed' })
  @ValidateIf(o => o.error != null)
  error?: { message: string };

  @ApiPropertyOptional({ description: 'Cart items' })
  @IsOptional()
  cartItems?: any[];
} 