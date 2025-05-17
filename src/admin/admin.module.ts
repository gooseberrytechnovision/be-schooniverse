import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './entities/admin.entity';
import { DecodeTokenMiddleware } from './middleware/decode-token.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
   
  ],
  controllers: [AdminController],
  providers: [AdminService,JwtService],
  exports: [AdminService]
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DecodeTokenMiddleware)
      .forRoutes('admins/load/user');
  }
} 