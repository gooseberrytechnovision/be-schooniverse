import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BulkCreateStudentsDto } from './dto/bulk-create-students.dto';
import { CreateStudentWithParentDto } from './dto/create-student-with-parent.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
    type: Student,
  })
  @ApiResponse({ status: 409, description: 'USID already exists' })
  async create(@Body() createStudentDto: CreateStudentWithParentDto): Promise<any> {
    return await this.studentsService.bulkCreateWithParents([createStudentDto]);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create students with parent information' })
  @ApiResponse({
    status: 201,
    description: 'Students and parents processed',
  })
  async bulkCreate(@Body() bulkDto: BulkCreateStudentsDto): Promise<any> {
    return await this.studentsService.bulkCreateWithParents(bulkDto.students);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
  //@ApiBearerAuth()
  @ApiOperation({ summary: 'Update student details' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'USID already exists' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Get()
  async findAll(): Promise<Student[]> {
    return await this.studentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Student> {
    return await this.studentsService.findOne(id);
  }

  @Get('usid/:usid')
  async findByUsid(@Param('usid') usid: string): Promise<Student> {
    return await this.studentsService.findByUsid(usid);
  }

  @Get('class/:className')
  async findByClass(@Param('className') className: string): Promise<Student[]> {
    return await this.studentsService.findByClass(className);
  }

  @Get('class/:className/section/:section')
  async findByClassAndSection(
    @Param('className') className: string,
    @Param('section') section: string,
  ): Promise<Student[]> {
    return await this.studentsService.findByClassAndSection(className, section);
  }

  @Get('campus/:campus')
  async findByCampus(@Param('campus') campus: string): Promise<Student[]> {
    return await this.studentsService.findByCampus(campus);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: number) {
    return this.studentsService.remove(id);
  }
}
