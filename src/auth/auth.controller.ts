import { Controller, Get, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth/youtube-auth.service';
import { AuthService } from './auth.service';
import { Response } from 'express';
import * as process from 'process';
import { URL } from 'url';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly youtubeAuthService: YoutubeAuthService,
        private readonly authService: AuthService,
    ) {}

    @Get('youtube/generate-auth-url')
    generateAuthUrl() {
        return {
            url: this.youtubeAuthService.generateAuthUrl(),
        };
    }

    @Get('youtube/callback')
    async callback(@Query('code') code: string, @Res() response: Response) {
        const user = await this.youtubeAuthService.callback(code);

        const jwtToken = await this.authService.login(user);

        const baseFrontRedirectUrl = process.env.YOUTUBE_AUTH_FRONT_REDIRECT!;
        const callBackFrontRedirectPath = 'callback';

        const url = new URL(`${baseFrontRedirectUrl}/${callBackFrontRedirectPath}`);
        url.searchParams.append('token', jwtToken);

        response.redirect(url.toString());
    }

    @Get('youtube/logout')
    async logout(@Res() response: Response) {
        await this.youtubeAuthService.logout();

        response.status(HttpStatus.OK).send();
    }

    @Get('youtube/me')
    @UseGuards(AuthGuard)
    me() {
        return this.youtubeAuthService.me();
    }
}