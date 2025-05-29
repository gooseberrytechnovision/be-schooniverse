import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
  
  async findSizesInBulk(sizesRequest: { [studentId: string]: number[] }): Promise<{ [studentId: string]: { [productId: string]: any } }> {
    // Create a map to store results
    const result: { [studentId: string]: { [productId: string]: any } } = {};
    
    // Get all student IDs
    const studentIds = Object.keys(sizesRequest).map(id => parseInt(id));
    
    // Get all product IDs (flattened list of all products for all students)
    const allProductIds = Object.values(sizesRequest).flat();
    
    // Build the where conditions for our query
    const whereConditions = [];
    
    for (const studentId of studentIds) {
      const productIds = sizesRequest[studentId];
      if (productIds && productIds.length > 0) {
        whereConditions.push({
          studentId,
          productId: In(productIds)
        });
      }
    }
    
    // If no valid conditions, return empty result
    if (whereConditions.length === 0) {
      return result;
    }
    
    // Query all sizes that match any of the conditions
    const sizes = await this.sizeRepository.find({
      where: whereConditions,
    });
    
    // Initialize result structure
    for (const studentId of studentIds) {
      result[studentId] = {};
    }
    
    // Populate result with actual size data
    for (const size of sizes) {
      if (!result[size.studentId]) {
        result[size.studentId] = {};
      }
      result[size.studentId][size.productId] = { ...size};
    }
    
    return result;
  }
} 