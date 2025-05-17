import { IsString, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateClassCategoryDto {
  @IsString()
  @Length(1, 50)
  categoryName: string;

  @IsNumber()
  @IsOptional()
  classStart?: number;

  @IsNumber()
  @IsOptional()
  classEnd?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  classStartRoman?: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  classEndRoman?: string;
} 