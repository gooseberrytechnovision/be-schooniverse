import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { Parent } from '../parents/entities/parent.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async getProfile(id: number, role: string) {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        const admin = await this.adminRepository.findOne({
          where: { id: id.toString() },
        });
        if (!admin) {
          throw new NotFoundException('Admin not found');
        }
        return admin;

      case 'PARENT':
        const parent = await this.parentRepository.findOne({
          where: { id: id.toString() },
        });
        if (!parent) {
          throw new NotFoundException('Parent not found');
        }
        return parent;

      case 'VENDOR':
        const vendor = await this.vendorRepository.findOne({ where: { id } });
        if (!vendor) {
          throw new NotFoundException('Vendor not found');
        }
        return vendor;

      default:
        throw new NotFoundException('Invalid role');
    }
  }

  async updateProfile(
    id: number,
    role: string,
    updateDto: UpdateAdminDto | UpdateParentDto | UpdateVendorDto,
  ) {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        const admin = await this.adminRepository.findOne({
          where: { id: id.toString() },
        });
        if (!admin) {
          throw new NotFoundException('Admin not found');
        }
        if (updateDto.password) {
          updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        Object.assign(admin, updateDto);
        return await this.adminRepository.save(admin);

      case 'PARENT':
        const parent = await this.parentRepository.findOne({
          where: { id: id.toString() },
        });
        if (!parent) {
          throw new NotFoundException('Parent not found');
        }
        if (updateDto.password) {
          updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        Object.assign(parent, updateDto);
        return await this.parentRepository.save(parent);

      case 'VENDOR':
        const vendor = await this.vendorRepository.findOne({ where: { id } });
        if (!vendor) {
          throw new NotFoundException('Vendor not found');
        }
        if (updateDto.password) {
          updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        Object.assign(vendor, updateDto);
        return await this.vendorRepository.save(vendor);

      default:
        throw new NotFoundException('Invalid role');
    }
  }
}
