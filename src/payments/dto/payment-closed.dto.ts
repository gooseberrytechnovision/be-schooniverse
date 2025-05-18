import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentClosedDto {
  @ApiProperty({ description: 'Customer code' })
  @IsString()
  @IsNotEmpty()
  order_code: string;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Cart items' })
  @IsOptional()
  cartItems?: any[];
}
