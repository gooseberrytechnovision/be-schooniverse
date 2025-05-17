import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
