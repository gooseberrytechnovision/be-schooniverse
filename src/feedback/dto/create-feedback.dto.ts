import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueryType } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  parent_id: number;

  @ApiProperty({ enum: QueryType })
  @IsEnum(QueryType)
  @IsNotEmpty()
  query_type: QueryType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  student_usid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  file_path?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  file_type?: string;
} 