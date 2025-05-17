import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { LoadUserDto } from './dto/load-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    email: string;
    sub: string;
    role: string;
  };
}

@ApiTags('admins')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() adminLoginDto: AdminLoginDto) {
    return this.adminService.login(adminLoginDto);
  }

 

  @Get('vendors')
  @ApiOperation({ summary: 'Get all vendor admins' })
  @ApiResponse({ status: 200, description: 'Returns all vendor admins' })
  findVendors() {
    return this.adminService.findVendors();
  }
  @Get('load/user')
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Load admin user details' })
  @ApiResponse({ status: 200, description: 'User loaded successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  loadUser(@Req() req: RequestWithUser) {
    return this.adminService.loadUser(req.user.email);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'Returns all admins' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get admin by id' })
  @ApiResponse({ status: 200, description: 'Returns the admin' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
} 