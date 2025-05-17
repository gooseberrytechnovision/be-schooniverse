import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassCategory } from './entities/class-category.entity';
import { CreateClassCategoryDto } from './dto/create-class-category.dto';

@Injectable()
export class ClassCategoriesService {
  constructor(
    @InjectRepository(ClassCategory)
    private readonly classCategoryRepository: Repository<ClassCategory>,
  ) {}

  async create(createClassCategoryDto: CreateClassCategoryDto): Promise<ClassCategory> {
    const classCategory = this.classCategoryRepository.create(createClassCategoryDto);
    return await this.classCategoryRepository.save(classCategory);
  }

  async findAll(): Promise<ClassCategory[]> {
    return await this.classCategoryRepository.find();
  }

  async findOne(id: number): Promise<ClassCategory> {
    const classCategory = await this.classCategoryRepository.findOne({
      where: { id },
    });

    if (!classCategory) {
      throw new NotFoundException(`Class category with ID ${id} not found`);
    }

    return classCategory;
  }

  async update(id: number, updateClassCategoryDto: CreateClassCategoryDto): Promise<ClassCategory> {
    const classCategory = await this.findOne(id);
    Object.assign(classCategory, updateClassCategoryDto);
    return await this.classCategoryRepository.save(classCategory);
  }

  async remove(id: number): Promise<void> {
    const classCategory = await this.findOne(id);
    await this.classCategoryRepository.remove(classCategory);
  }
} 