import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStudentWithParentDto } from './create-student-with-parent.dto';

export class BulkCreateStudentsDto {
  @ApiProperty({ 
    description: 'Array of student data with parent information',
    type: [CreateStudentWithParentDto],
    isArray: true
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStudentWithParentDto)
  students: CreateStudentWithParentDto[];
} 