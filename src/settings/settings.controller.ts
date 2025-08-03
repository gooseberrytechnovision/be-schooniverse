import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@ApiTags('settings')
@Controller('settings')
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully', type: SettingsResponseDto })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @Roles('admin')
  @ApiOperation({ summary: 'Update global settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully', type: SettingsResponseDto })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }
} 