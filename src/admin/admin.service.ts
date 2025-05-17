import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { LoadUserDto } from './dto/load-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async loadUser(email: string) {
    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'role', 'phoneNumber', 'imageUrl'], // Exclude password
    });

    if (!admin) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User loaded successfully',
      admin,
    };
  }

  async login(adminLoginDto: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({
      where: { email: adminLoginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      adminLoginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create JWT payload with encoded email
    const payload = {
      sub: admin.id,
      email: admin.email, // Encode email in base64
      role: admin.role,
    };

    // Generate JWT token
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      success: true,
      message: 'Login successful',
      access_token: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phoneNumber: admin.phoneNumber,
      },
    };
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    return this.adminRepository.save(admin);
  }

  async findAll() {
    const admins = await this.adminRepository.find({
      select: ['id', 'name', 'email', 'phoneNumber', 'role', 'imageUrl'], // Exclude password
    });

    return {
      success: true,
      message: 'Admins retrieved successfully',
      admins,
    };
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    Object.assign(admin, updateAdminDto);
    return this.adminRepository.save(admin);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findOne(id);
    await this.adminRepository.remove(admin);
  }

  async findVendors() {
    const vendors = await this.adminRepository.find({
      where: { role: 'vendor' },
      select: ['id', 'name', 'email', 'phoneNumber', 'role', 'imageUrl'], // Exclude password
    });

    return {
      success: true,
      message: 'Vendors retrieved successfully',
      vendors,
    };
  }
}
