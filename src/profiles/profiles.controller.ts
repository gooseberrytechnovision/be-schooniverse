import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  async getProfile(
    @Param('id') id: number,
    @Query('role') role: string,
  ) {
    return this.profilesService.getProfile(id, role);
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: number,
    @Query('role') role: string,
    @Body() updateDto: UpdateAdminDto | UpdateParentDto | UpdateVendorDto,
  ) {
    return this.profilesService.updateProfile(id, role, updateDto);
  }
} 