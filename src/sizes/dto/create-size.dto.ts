import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSizeDto {
  @IsNumber()
  @IsNotEmpty()
  size: string;

  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  productId: number;
} 