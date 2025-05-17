import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('class_categories')
export class ClassCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_name', length: 50 })
  categoryName: string;

  @Column({ name: 'class_start', type: 'int', nullable: true })
  classStart: number;

  @Column({ name: 'class_end', type: 'int', nullable: true })
  classEnd: number;

  @Column({ name: 'class_start_roman', length: 10, nullable: true })
  classStartRoman: string;

  @Column({ name: 'class_end_roman', length: 10, nullable: true })
  classEndRoman: string;
} 