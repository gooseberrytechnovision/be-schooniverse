import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { Parent } from './entities/parent.entity';
import { Student } from '../students/entities/student.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Student])
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'parents/me', method: RequestMethod.GET });
  }
} 