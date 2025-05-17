import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateParentDto {
  @IsString()
  parentName: string;

  @IsArray()
  @IsString({ each: true })
  studentUsids: string[];

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  campus?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  password: string;
} 