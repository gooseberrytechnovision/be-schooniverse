import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Student USID for parent login',
    example: 'USID123'
  })
  @IsString()
  @IsNotEmpty()
  usid: string;

  @ApiProperty({
    description: 'Parent password',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
} 