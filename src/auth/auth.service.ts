import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../parents/entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) { }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(sendOtpDto: SendOtpDto) {
    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${sendOtpDto.usid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        throw new NotFoundException('Parent not found with this USID');
      }

      // Generate 6-digit OTP
      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // Update parent with OTP
      parent.otp = otp;
      parent.otpExpiresAt = expiresAt;
      parent.isOtpVerified = false;
      await this.parentRepository.save(parent);

      let otpText = `Dear Parent, ${otp} is the One Time Password to access The Thathva Uniforms Portal. Do not share this OTP with anyone for security reasons. Regards, Team Thathva`;
      
      // Send OTP via SMS using parent's phone number
      const smsUrl = `http://sms.teleosms.com/api/mt/SendSMS?APIKey=${process.env.SMS_API_KEY}&senderid=THATVA&channel=Trans&DCS=0&flashsms=0&number=91${parent.phoneNumber}&text=${otpText}&route=2`;
      
      await this.httpService.axiosRef.get(smsUrl).then((res)=>{
        console.log(res.data,'res***');
      });

      return {
        success: true,
        message: `OTP sent to mobile number ending with XXX-XXX-${parent.phoneNumber.slice(-4)} successfully`,
        expiresIn: '10 minutes'
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP', {
        cause: error,
        description: error.message
      });
    }
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${verifyOtpDto.usid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        throw new NotFoundException('Parent not found with this USID');
      }

      // Check if OTP exists and is not expired
      if (!parent.otp || !parent.otpExpiresAt) {
        throw new BadRequestException('No OTP found for this USID');
      }

      if (new Date() > parent.otpExpiresAt) {
        throw new BadRequestException('OTP has expired');
      }

      // Verify OTP
      if (parent.otp !== verifyOtpDto.otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Mark OTP as verified
      parent.isOtpVerified = true;
      parent.otp = null;
      parent.otpExpiresAt = null;

      const payload = {
        sub: verifyOtpDto.usid,
        role: parent.role,
        parentId: parent.id
      };

      const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });
      await this.parentRepository.save(parent);

      return {
        success: true,
        message: 'OTP verified successfully',
        access_token: token
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify OTP', {
        cause: error,
        description: error.message
      });
    }
  }

  async login(loginDto: LoginDto) {
    if (!loginDto.usid || !loginDto.password) {
      throw new BadRequestException('Both Student USID and password are required for login');
    }

    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${loginDto.usid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        throw new NotFoundException(`Parent not found`, {

          cause: new Error('Parent not found'),
          description: 'Parent not found'

        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, parent.password);
      if (!isPasswordValid) {

        throw new NotFoundException(`Invalid password`, {

          cause: new Error('Invalid password'),
          description: 'Invalid password'

        })
      }

      // Fetch data only for the logging-in student
      const student = await this.studentRepository.findOne({
        where: { usid: loginDto.usid },
        select: ['usid', 'studentName', 'class', 'section']
      });

      if (!student) {
        throw new BadRequestException('Student not found');
      }

      // Generate JWT token
      const payload = {
        sub: loginDto.usid,
        role: parent.role,
        parentId: parent.id
      };

      const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET });

      // Return success with parent data and specific student data
      return {
        success: true,
        message: 'Login successful',
        exists: true,
        name: parent.parentName,
        student: student,
        access_token: token,
        isFirstTimeLogin: loginDto.password === 'Th@thvaUni#2025' ? true : false,
        parentId: parent.id
      };

    } catch (error) {
      throw new InternalServerErrorException('Error during login verification', {
        cause: error,
        description: error.message
      });
    }
  }

  async parentLogin(studentUsid: string): Promise<{ exists: boolean; parentData?: any }> {
    if (!studentUsid) {
      throw new BadRequestException('Student USID is required for login');
    }

    try {
      // Find parent with the given student USID in their students array
      const parent = await this.parentRepository
        .createQueryBuilder('parent')
        .where(`'${studentUsid}' = ANY(parent.students)`)
        .getOne();

      if (!parent) {
        return { exists: false };
      }

      // Fetch student data for each student ID
      const studentData = await Promise.all(
        parent.students.map(async (usid) => {
          const student = await this.studentRepository.findOne({
            where: { usid }
          });
          return student;
        })
      );

      // Return success with parent data
      return {
        exists: true,
        parentData: {
          ...parent,
          studentData
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Error during login verification', {
        cause: error,
        description: error.message
      });
    }
  }
} 