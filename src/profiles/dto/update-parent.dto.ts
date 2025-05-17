import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateParentDto {
  @IsString()
  @IsOptional()
  parentName?: string;

  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  campus?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
