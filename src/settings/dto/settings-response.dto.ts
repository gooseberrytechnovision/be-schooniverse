import { ApiProperty } from '@nestjs/swagger';
import { Settings } from '../entities/settings.entity';

export class SettingsResponseDto {
  @ApiProperty({ example: true, description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ example: 'Settings retrieved successfully', description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Settings data' })
  settings: Settings;
} 