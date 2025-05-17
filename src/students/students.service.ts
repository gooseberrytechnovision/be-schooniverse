import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Parent } from '../parents/entities/parent.entity';
import { CreateStudentWithParentDto } from './dto/create-student-with-parent.dto';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Check if USID already exists
    const existingStudent = await this.studentRepository.findOne({
      where: { usid: createStudentDto.usid },
    });

    if (existingStudent) {
      throw new ConflictException(
        `Student with USID ${createStudentDto.usid} already exists`,
      );
    }

    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async bulkCreateWithParents(studentsData: CreateStudentWithParentDto[]): Promise<{ 
    success: boolean; 
    message: string;
    created: number;
    failed: number;
    results: Array<{ 
      success: boolean; 
      student?: Student; 
      parent?: Parent; 
      error?: string; 
    }>;
  }> {
    const results = [];
    let created = 0;
    let failed = 0;

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const studentData of studentsData) {
        try {
          // Check if student with USID already exists
          const existingStudent = await queryRunner.manager.findOne(Student, {
            where: { usid: studentData.usid },
          });

          if (existingStudent) {
            results.push({
              success: false,
              error: `Student with USID ${studentData.usid} already exists`,
            });
            failed++;
            continue;
          }

          const studentEntity = {
            ...studentData,
          };
          const student = queryRunner.manager.create(Student, studentEntity);
          const savedStudent = await queryRunner.manager.save(Student, student);

          // Check if parent exists with the given phone number
          let parent = await queryRunner.manager.findOne(Parent, {
            where: { phoneNumber: studentData.phoneNumber },
          });

          if (parent) {
            if (!parent.students) {
              parent.students = [];
            }
            
            if (!parent.students.includes(studentData.usid)) {
              parent.students.push(studentData.usid);
              await queryRunner.manager.save(Parent, parent);
            }
          } else {
            const parentEntity = {
              parentName: studentData.parentName,
              phoneNumber: studentData.phoneNumber,
              email: studentData.email,
              students: [studentData.usid],
              address: studentData.address || null,
            };

            parent = queryRunner.manager.create(Parent, parentEntity);
            parent = await queryRunner.manager.save(Parent, parent);
          }

          results.push({
            success: true,
            student: savedStudent,
            parent,
          });
          created++;
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
          });
          failed++;
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Processed ${studentsData.length} students. Created: ${created}, Failed: ${failed}`,
        created,
        failed,
        results,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error during bulk student creation: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async findOne(id: number): Promise<Student> {
    return await this.studentRepository.findOne({
      where: { id },
    });
  }

  async findByUsid(usid: string): Promise<Student> {
    if (!usid) {
      throw new BadRequestException('Student USID is required');
    }

    try {
      console.log('Searching for USID:', usid);
      const student = await this.studentRepository.findOne({
        where: { usid },
      });
      console.log('Result:', student);

      if (!student) {
        throw new NotFoundException(`Student with USID ${usid} not found`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while fetching student data',
      );
    }
  }

  async findByClass(className: string): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { class: className },
      order: {
        section: 'ASC',
        studentName: 'ASC',
      },
    });
  }

  async findByClassAndSection(
    className: string,
    section: string,
  ): Promise<Student[]> {
    return await this.studentRepository.find({
      where: {
        class: className,
        section,
      },
      order: {
        studentName: 'ASC',
      },
    });
  }

  async findByCampus(campus: string): Promise<Student[]> {
    return await this.studentRepository.find({
      where: { campus },
      order: {
        class: 'ASC',
        section: 'ASC',
        studentName: 'ASC',
      },
    });
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { usid: id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Check if USID is being updated and if it already exists
    if (updateStudentDto.usid && updateStudentDto.usid !== student.usid) {
      const existingStudent = await this.studentRepository.findOne({
        where: { usid: updateStudentDto.usid },
      });
      if (existingStudent) {
        throw new ConflictException('USID already exists');
      }
    }

    // Update student details
    Object.assign(student, updateStudentDto);

    // Save the updated student
    const updatedStudent = await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    };
  }
}
