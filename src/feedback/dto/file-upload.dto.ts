import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsString()
  @IsNotEmpty()
  file: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fileType?: string;
} 