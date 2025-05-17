import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray, IsEnum, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, StudentType } from '../entities/bundle.entity';

class BundleProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'Quantity of product in bundle' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Whether this product is optional in the bundle' })
  optional: boolean;
}

export class CreateBundleDto {
  @ApiProperty({ description: 'Bundle name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Bundle image URL' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ enum: Gender, description: 'Gender the bundle is for' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ enum: StudentType, description: 'Student type the bundle is for' })
  @IsEnum(StudentType)
  @IsNotEmpty()
  studentType: StudentType;

  @ApiProperty({ description: 'Applicable classes for the bundle' })
  @IsString()
  @IsNotEmpty()
  applicableClasses: string;

  @ApiProperty({ description: 'Total price of the bundle' })
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty({ description: 'Products in the bundle', type: [BundleProductDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BundleProductDto)
  products: BundleProductDto[];
} 