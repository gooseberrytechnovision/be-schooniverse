import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 201, description: 'OTP sent successfully' })
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    return await this.authService.sendOTP(sendOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOTP(verifyOtpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with USID and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message,
          exists: false
        };
      }
      throw error;
    }
  }
} 