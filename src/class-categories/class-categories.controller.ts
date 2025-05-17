import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ClassCategoriesService } from './class-categories.service';
import { CreateClassCategoryDto } from './dto/create-class-category.dto';
import { ClassCategory } from './entities/class-category.entity';

@Controller('class-categories')
export class ClassCategoriesController {
  constructor(private readonly classCategoriesService: ClassCategoriesService) {}

  @Post()
  async create(@Body() createClassCategoryDto: CreateClassCategoryDto): Promise<ClassCategory> {
    return await this.classCategoriesService.create(createClassCategoryDto);
  }

  @Get()
  async findAll(): Promise<ClassCategory[]> {
    return await this.classCategoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ClassCategory> {
    return await this.classCategoriesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateClassCategoryDto: CreateClassCategoryDto,
  ): Promise<ClassCategory> {
    return await this.classCategoriesService.update(id, updateClassCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.classCategoriesService.remove(id);
  }
} 