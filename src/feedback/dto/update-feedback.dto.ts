import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { QueryType } from '../entities/feedback.entity';

export class UpdateFeedbackDto {
  @ApiProperty({ required: false, enum: QueryType })
  @IsOptional()
  @IsEnum(QueryType)
  query_type?: QueryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  student_usid?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  file_path?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  file_type?: string;
} 