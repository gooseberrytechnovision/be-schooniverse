import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  usid: string;
} 