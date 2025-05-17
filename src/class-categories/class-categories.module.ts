import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassCategoriesService } from './class-categories.service';
import { ClassCategoriesController } from './class-categories.controller';
import { ClassCategory } from './entities/class-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassCategory])],
  controllers: [ClassCategoriesController],
  providers: [ClassCategoriesService],
})
export class ClassCategoriesModule {} 