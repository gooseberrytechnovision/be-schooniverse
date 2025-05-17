import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GetUsid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const usid = request.headers['x-usid'];

    if (!usid) {
      throw new UnauthorizedException('USID not found in request headers');
    }

    return usid;
  },
); 