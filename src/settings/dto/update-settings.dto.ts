import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({ required: false, example: true, description: 'Enable/disable individual products' })
  @IsBoolean()
  @IsOptional()
  enableIndividualProducts?: boolean;

  @ApiProperty({ required: false, example: true, description: 'Enable/disable bulk products' })
  @IsBoolean()
  @IsOptional()
  enableBulkProducts?: boolean;

  @ApiProperty({ required: false, example: true, description: 'Enable/disable purchasing' })
  @IsBoolean()
  @IsOptional()
  enablePurchasing?: boolean;

  @ApiProperty({ required: true, example: '1234', description: 'Security code' })
  securityCode?: string;
} 