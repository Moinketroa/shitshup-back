import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const YoutubeUserParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.youtubeUser;
});
