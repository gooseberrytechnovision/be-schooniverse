import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BundleProduct } from './bundle-product.entity';
import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';

export enum StudentType {
  NEW = 'NEW',
  EXISTING = 'EXISTING'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNISEX = 'UNISEX'
}

@Entity('bundles')
export class Bundle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ name: 'applicable_classes', length: 100 })
  @IsString()
  @IsNotEmpty()
  applicableClasses: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.UNISEX })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @Column({ name: 'student_type', type: 'enum', enum: StudentType })
  @IsEnum(StudentType)
  @IsNotEmpty()
  studentType: StudentType;

  @Column('decimal', { precision: 10, scale: 2 ,name: 'total_price'})
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @Column({ name: 'image', length: 255 })
  @IsString()
  @IsNotEmpty()
  image: string;

  @OneToMany(() => BundleProduct, (bundleProduct) => bundleProduct.bundle, {
    cascade: true,
    eager: true
  })
  bundleProducts: BundleProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 