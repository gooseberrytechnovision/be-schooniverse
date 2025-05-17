import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  usid: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const GetUsid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log(authHeader,'authHeader***');
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // // Extract token
    // const token = authHeader.split(' ')[1];
    // if (!token) {
    //   throw new UnauthorizedException('Invalid authorization header format');
    // }

    try {
      // Decode JWT token
      const decoded = jwt.verify(authHeader, process.env.JWT_SECRET) as JwtPayload;
      console.log(decoded,'***');
      if (!decoded.usid) {
        throw new UnauthorizedException('Invalid token: USID not found');
      }

      return decoded.usid;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  },
); 