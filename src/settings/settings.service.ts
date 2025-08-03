import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {
  }

  // Get the current settings (should be only one record)
  async getSettings() {
    const settings = await this.settingsRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' }
    });
    
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    return {
      success: true,
      message: 'Settings retrieved successfully',
      settings,
    };
  }

  // Update settings
  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    // Get current settings

    if (updateSettingsDto.securityCode !== process.env.SECURITY_CODE) {
      return {
        success: false,
        message: 'Invalid security code',
      };
    }

    const settings = await this.settingsRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' }
    });

    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    // Update with new values
    Object.assign(settings, updateSettingsDto);
    await this.settingsRepository.save(settings);

    return {
      success: true,
      message: 'Settings updated successfully',
      settings,
    };
  }
} 