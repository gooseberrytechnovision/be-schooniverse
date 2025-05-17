import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class CreateStudentWithParentDto extends CreateStudentDto {
  @ApiProperty({ description: 'Parent name' })
  @IsNotEmpty()
  @IsString()
  parentName: string;

  @ApiProperty({ description: 'Parent phone number' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Parent email' })
  @IsEmail()
  email: string;
} 