import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;      // USID
  role: string;     // User role
  iat?: number;     // Issued at
  exp?: number;     // Expiration time
}

// Extend Express Request interface to include usid
declare global {
  namespace Express {
    interface Request {
      usid?: string;
      userRole?: string;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization,'*******')

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Extract token
    // const token = authHeader.split(' ')[1];
    // if (!token) {
    //   throw new UnauthorizedException('Invalid authorization header format');
    // }

    try {
      // Decode JWT token
      const decoded = jwt.verify(authHeader, process.env.JWT_SECRET) as JwtPayload;
      
      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token: USID not found in sub claim');
      }

      // Add decoded data to request object
      req.usid = decoded.sub;
      req.userRole = decoded.role;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
} 