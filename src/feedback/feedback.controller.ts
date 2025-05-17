import { Controller, Get, Post, Body, Param, Put, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('feedback')
@Controller('feedback')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  //@Roles('parent')
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully', type: FeedbackResponseDto })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
   //@User() user: { id: number; name: string }
  ): Promise<FeedbackResponseDto> {
    //createFeedbackDto.parent_name = user.name;
    return await this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'List of all feedback', type: [FeedbackResponseDto] })
  async findAll(): Promise<FeedbackResponseDto[]> {
    return await this.feedbackService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'parent')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback found', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: { id: number; role: string; name: string }
  ): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackService.findOne(id);
    
    // Parents can only view their own feedback
    if (user.role === 'parent' && feedback.parent_name !== user.name) {
      throw new ForbiddenException('You can only view your own feedback');
    }
    
    return feedback;
  }

  @Get('parent/:id')
  @Roles('admin', 'parent')
  @ApiOperation({ summary: 'Get feedback by parent name' })
  @ApiResponse({ status: 200, description: 'List of feedback for parent', type: [FeedbackResponseDto] })
  async findByParent(
    @Param('id') id: number,
    //@User() user: { id: number; role: string; name: string }
  ): Promise<FeedbackResponseDto[]> {
    // Parents can only view their own feedback
    // if (user.role === 'parent' && name !== user.name) {
    //   throw new ForbiddenException('You can only view your own feedback');
    // }
    
    return await this.feedbackService.findByParentName(id);
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update feedback status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<FeedbackResponseDto> {
    return await this.feedbackService.updateStatus(id, status);
  }

  @Put(':id')
  //@Roles('parent')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully', type: FeedbackResponseDto })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own feedback' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    //@User() user: { id: number; name: string }
  ): Promise<FeedbackResponseDto> {
    return await this.feedbackService.update(id, updateFeedbackDto);
  }
} 