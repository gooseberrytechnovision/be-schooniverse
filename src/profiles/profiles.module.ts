import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { Parent } from '../parents/entities/parent.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Parent, Vendor])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {} 