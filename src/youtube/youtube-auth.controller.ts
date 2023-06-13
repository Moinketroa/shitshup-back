import {
    Controller,
    Get,
    HttpStatus,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';
import { YoutubeAuthGuard } from './youtube-auth.guard';
import { Response } from 'express';
import * as process from 'process';

@Controller('youtube/auth')
export class YoutubeAuthController {
    constructor(private readonly youtubeAuthService: YoutubeAuthService) {}

    @Get('generate-auth-url')
    generateAuthUrl() {
        return {
            url: this.youtubeAuthService.generateAuthUrl(),
        };
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() response: Response) {
        await this.youtubeAuthService.callback(code);

        response.redirect(process.env.YOUTUBE_AUTH_FRONT_REDIRECT!);
    }

    @Get('logout')
    async logout(@Res() response: Response) {
        await this.youtubeAuthService.logout();

        response.status(HttpStatus.OK).send();
    }

    @Get('me')
    @UseGuards(YoutubeAuthGuard)
    me() {
        return this.youtubeAuthService.me();
    }
}
