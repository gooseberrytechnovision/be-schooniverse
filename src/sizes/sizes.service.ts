import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Size } from './entities/size.entity';
import { CreateSizeDto } from './dto/create-size.dto';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async createOrUpdate(createSizeDto: CreateSizeDto): Promise<Size> {
    // Try to find existing size entry for this student and product
    const existingSize = await this.sizeRepository.findOne({
      where: { 
        studentId: createSizeDto.studentId, 
        productId: createSizeDto.productId 
      }
    });

    if (existingSize) {
      // Update existing record
      Object.assign(existingSize, createSizeDto);
      return this.sizeRepository.save(existingSize);
    } else {
      // Create new record
      const size = this.sizeRepository.create(createSizeDto);
      return this.sizeRepository.save(size);
    }
  }

  async findAll(): Promise<Size[]> {
    return this.sizeRepository.find();
  }

  async findOne(id: number): Promise<Size> {
    const size = await this.sizeRepository.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    return size;
  }

  async findByStudentAndProduct(studentId: number, productId: number): Promise<Size> {
    const size = await this.sizeRepository.findOne({
      where: { studentId, productId },
    });
    
    if (!size) {
      throw new NotFoundException(`Size not found for student ${studentId} and product ${productId}`);
    }
    
    return size;
  }

  async removeByStudentAndProduct(studentId: number, productId: number): Promise<void> {
    const size = await this.findByStudentAndProduct(studentId, productId);
    await this.sizeRepository.remove(size);
  }
} 