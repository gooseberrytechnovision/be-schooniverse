import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DecodeTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    console.log(authHeader,'^^^^');
    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      //const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(authHeader, { secret: process.env.JWT_SECRET });
      console.log(decoded,'*********');
      // Add decoded user to request  
      req['user'] = {
        email: decoded.email, // Decode base64 email
        sub: decoded.sub,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 