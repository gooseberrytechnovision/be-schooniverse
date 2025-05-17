import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum QueryType {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative',
  FINANCIAL = 'financial',
  OTHER = 'other'
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({name: 'parent_id'})
  @ApiProperty()
  parent_id: number;

  @Column()
  @ApiProperty()
  parent_name: string;

  @Column({
    type: 'enum',
    enum: QueryType,
    default: QueryType.OTHER
  })
  @ApiProperty({ enum: QueryType })
  query_type: QueryType;

  @Column()
  @ApiProperty()
  student_usid: string;

  @Column('text')
  @ApiProperty()
  description: string;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  file_path?: string;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  file_type?: string;

  @Column({ default: 'pending' })
  @ApiProperty()
  status: string;

  @CreateDateColumn()
  @ApiProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updated_at: Date;
} 