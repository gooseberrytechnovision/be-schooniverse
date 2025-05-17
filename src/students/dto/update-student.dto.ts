import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usid?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  admissionYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  className?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
} 