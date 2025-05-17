import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, QueryType } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { PubSubService } from '../notifications/pub-sub.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly pubSubService: PubSubService,
  ) {}

  private transformToResponseDto(feedback: any): FeedbackResponseDto {
    return {
      id: feedback.feedback_id, // Renamed to match raw result field
      parent_id: feedback.feedback_parent_id,
      parent_name: feedback.feedback_parent_name,
      query_type: feedback.feedback_query_type,
      student_usid: feedback.feedback_student_usid,
      status: feedback.feedback_status,
      created_at: feedback.feedback_created_at,
      updated_at: feedback.feedback_updated_at,
      student_name: feedback.student_name,
      student_class: feedback.class,
      student_section: feedback.section,
      details: {
        description: feedback.feedback_description,
        file_path: feedback.feedback_file_path,
        file_type: feedback.feedback_file_type,
      },
    };
  }

  async create(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const feedback = this.feedbackRepository.create({
      parent_id: createFeedbackDto.parent_id,
      parent_name: createFeedbackDto.parent_name,
      query_type: createFeedbackDto.query_type,
      student_usid: createFeedbackDto.student_usid,
      description: createFeedbackDto.description,
      file_path: createFeedbackDto.file_path,
      file_type: createFeedbackDto.file_type,
      status: 'pending',
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Publish feedback created event
    await this.pubSubService.publish('feedback:created', {
      id: savedFeedback.id,
      parent_name: savedFeedback.parent_name,
      query_type: savedFeedback.query_type,
      student_usid: savedFeedback.student_usid,
      description: savedFeedback.description,
      created_at: savedFeedback.created_at,
    });

    return this.transformToResponseDto(savedFeedback);
  }

  async findAll(): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .innerJoin('students', 'student', 'student.usid = feedback.student_usid')
      .select([
        'feedback.id',
        'feedback.parent_id',
        'feedback.parent_name',
        'feedback.query_type',
        'feedback.student_usid',
        'feedback.description',
        'feedback.file_path',
        'feedback.file_type',
        'feedback.status',
        'feedback.created_at',
        'feedback.updated_at',
        'student.class AS class',
        'student.section AS section',
        'student.student_name AS student_name',
      ])
      .orderBy('feedback.created_at', 'DESC')
      .getRawMany();
    return feedbacks.map((feedback) => this.transformToResponseDto(feedback));
  }

  async findOne(id: number): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return this.transformToResponseDto(feedback);
  }

  async updateStatus(id: number, status: string): Promise<FeedbackResponseDto> {
    const feedback = await this.findOne(id);
    const updatedFeedback = await this.feedbackRepository.save({
      ...feedback,
      status,
    });

    // Publish status updated event
    await this.pubSubService.publish('feedback:status:updated', {
      id: updatedFeedback.id,
      parent_name: updatedFeedback.parent_name,
      status: updatedFeedback.status,
      updated_at: updatedFeedback.updated_at,
    });

    return this.transformToResponseDto(updatedFeedback);
  }

  async findByStudentEnrollId(
    studentEnrollId: string,
  ): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { student_usid: studentEnrollId },
      order: { created_at: 'DESC' },
    });
    return feedbacks.map((feedback) => this.transformToResponseDto(feedback));
  }

  async findByQueryType(queryType: QueryType): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { query_type: queryType },
      order: { created_at: 'DESC' },
    });
    return feedbacks.map((feedback) => this.transformToResponseDto(feedback));
  }

  async findByParentName(id: number): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .innerJoin('students', 'student', 'student.usid = feedback.student_usid')
      .select([
        'feedback.id',
        'feedback.parent_id',
        'feedback.parent_name',
        'feedback.query_type',
        'feedback.student_usid',
        'feedback.description',
        'feedback.file_path',
        'feedback.file_type',
        'feedback.status',
        'feedback.created_at',
        'feedback.updated_at',
        'student.class AS class',
        'student.section AS section',
        'student.student_name AS student_name',
      ])
      .where('feedback.parent_id = :id', { id }) // Apply the condition based on parent_id
      .orderBy('feedback.created_at', 'DESC')
      .getRawMany();

    return feedbacks.map((feedback) => this.transformToResponseDto(feedback));
  }

  async update(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // if (feedback.parent_name !== parentName) {
    //   throw new ForbiddenException('You can only update your own feedback');
    // }

    const updatedFeedback = await this.feedbackRepository.save({
      ...feedback,
      ...updateFeedbackDto,
    });

    await this.pubSubService.publish('feedback:updated', {
      id: updatedFeedback.id,
      parent_name: updatedFeedback.parent_name,
      query_type: updatedFeedback.query_type,
      student_usid: updatedFeedback.student_usid,
      updated_at: updatedFeedback.updated_at,
    });

    return this.transformToResponseDto(updatedFeedback);
  }
}
