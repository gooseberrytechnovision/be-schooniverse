import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SizesService } from './sizes.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { Size } from './entities/size.entity';

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Post()
  createOrUpdate(@Body() createSizeDto: CreateSizeDto): Promise<Size> {
    return this.sizesService.createOrUpdate(createSizeDto);
  }

  @Get()
  findAll(): Promise<Size[]> {
    return this.sizesService.findAll();
  }

  @Get('student/:studentId/product/:productId')
  findByStudentAndProduct(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Size> {
    return this.sizesService.findByStudentAndProduct(studentId, productId);
  }

  @Delete('student/:studentId/product/:productId')
  removeByStudentAndProduct(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    return this.sizesService.removeByStudentAndProduct(studentId, productId);
  }
  
  @Post('bulk')
  findSizesInBulk(
    @Body() sizesRequest: { [studentId: string]: number[] }
  ): Promise<{ [studentId: string]: { [productId: string]: string } }> {
    return this.sizesService.findSizesInBulk(sizesRequest);
  }
} 