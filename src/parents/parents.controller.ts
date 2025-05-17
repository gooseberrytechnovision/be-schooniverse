import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Parent } from './entities/parent.entity';
import { GetUsid } from './decorators/get-usid.decorator';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('parents')
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('me')
  async getCurrentParent(@Req() req: Request): Promise<Parent> {
    return this.parentsService.findByStudentUsid(req.usid);
  }

  @Post()
  async create(@Body() createParentDto: CreateParentDto): Promise<Parent> {
    return await this.parentsService.create(createParentDto);
  }

  @Post('find-by-phone')
  @ApiOperation({ summary: 'Find parent by phone number' })
  @ApiResponse({
    status: 200,
    description: 'Parent found successfully',
    type: Parent,
  })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  async findByPhoneNumber(@Body() phoneNumberData: { phoneNumber: string }): Promise<Parent> {
    return await this.parentsService.findByPhoneNumber(phoneNumberData.phoneNumber);
  }

  @Get()
  async findAll(): Promise<Parent[]> {
    return await this.parentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Parent> {
    return await this.parentsService.findOne(id);
  }

  @Get('student/:usid')
  async findByStudentUsid(@Param('usid') usid: string): Promise<Parent> {
    return await this.parentsService.findByStudentUsid(usid);
  }

  @Put(':id/add-student/:usid')
  async addStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.addStudent(id, usid);
  }

  @Delete(':id/remove-student/:usid')
  async removeStudent(
    @Param('id') id: number,
    @Param('usid') usid: string,
  ): Promise<Parent> {
    return await this.parentsService.removeStudent(id, usid);
  }
}
