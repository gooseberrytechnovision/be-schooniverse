import { ApiProperty } from '@nestjs/swagger';
import { QueryType } from '../entities/feedback.entity';

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Unique identifier of the feedback' })
  id: number;

  @ApiProperty({ description: 'Parent ID' })
  parent_id: number;

  @ApiProperty({ description: 'Name of the parent who submitted the feedback' })
  parent_name: string;

  @ApiProperty({ description: 'Type of query/feedback' })
  query_type: QueryType;

  @ApiProperty({ description: 'Student USID' })
  student_usid: string;

  @ApiProperty({ description: 'Status of the feedback' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Feedback details' })
  details: {
    description: string;
    file_path?: string;
    file_type?: string;
  };
  @ApiProperty({ description: 'Student name' })
  student_name: string;

  @ApiProperty({ description: 'Student class' })
  student_class: string;

  @ApiProperty({ description: 'Student section' })
  student_section: string;
}
