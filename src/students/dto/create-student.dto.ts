import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student USID' })
  @IsNotEmpty()
  @IsString()
  usid: string;

  @ApiProperty({ description: 'Student name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Student class' })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({ description: 'Student section' })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ description: 'Student campus' })
  @IsNotEmpty()
  @IsString()
  campus: string;

  @ApiProperty({ description: 'Student parent ID', required: false })
  @IsOptional()
  @IsString()
  parent_id?: string;

  @ApiProperty({ description: 'Student address', required: false })
  @IsOptional()
  @IsString()
  address?: string;
} 