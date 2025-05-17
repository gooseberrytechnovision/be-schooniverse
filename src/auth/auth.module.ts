import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Parent } from '../parents/entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Student]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService]
})
export class AuthModule {} 