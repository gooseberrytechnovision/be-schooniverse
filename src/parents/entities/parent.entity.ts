import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_name' })
  parentName: string;

  @Column({ name: 'phonenumber' })
  phoneNumber: string;

  @Column({ name: 'email' })
  email: string;

  @Column('text', { array: true, name: 'students', nullable: true })
  students: string[];

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ nullable: true })
  campus: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true, default: null })
  password?: string;

  @Column({ default: 'parent' })
  role: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true, name: 'otp_expires_at' })
  otpExpiresAt: Date;

  @Column({ default: false, name: 'is_otp_verified' })
  isOtpVerified: boolean;

  @Column({ type: 'varchar', length: 255, name: 'image' })
  imageUrl: string;

  // @CreateDateColumn()
  // createdAt: Date;

  // @UpdateDateColumn()
  // updatedAt: Date;

  studentData?: Student[];
}
