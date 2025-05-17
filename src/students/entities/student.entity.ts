import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { Size } from '../../sizes/entities/size.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'usid',
    nullable: false,
    unique: true
  })
  usid: string;

  @Column({ name: 'student_name' })
  studentName: string;


  @Column({ name: 'student_type' })
  studentType: string;

  @Column({ name: 'admission_year' })
  admissionYear: string;

  // @BeforeInsert()
  // @BeforeUpdate()
  // setStudentType() {
  //   const currentYear = new Date().getFullYear();
  //   this.studentType = this.admissionYear.includes(currentYear.toString()) ? 'New' : 'Existing';
  // }

  @Column({ name: 'boarding' })
  boardingStatus: string;

  // @Column({ name: 'father_name' })
  // fatherName: string;

  @Column()
  gender: string;

  @Column()
  campus: string;

  @Column({ name: 'class' })
  class: string;

  @Column()
  section: string;

  @Column()
  address: string;

  @Column()
  house: string;
  
  @OneToMany(() => Size, (size) => size.student)
  sizes: Size[];
} 