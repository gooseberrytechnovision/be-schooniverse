import { IsString, IsNotEmpty } from 'class-validator';
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
}
