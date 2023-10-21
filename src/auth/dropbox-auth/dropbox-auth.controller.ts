import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DropboxAuthService } from './dropbox-auth.service';
import { AuthGuard } from '../guard/auth.guard';
import { DropboxAuthGuard } from './guard/dropbox-auth.guard';
import { DropboxUser } from './model/dropbox-user.model';

@Controller('auth/dropbox')
@UseGuards(AuthGuard)
export class DropboxAuthController {

    constructor(private readonly dropboxAuthService: DropboxAuthService) {
    }

    @Get('generate-auth-url')
    async generateAuthUrl() {
        return {
            url: await this.dropboxAuthService.generateAuthUrl(),
        };
    }

    @Get('callback')
    async callback(@Query('code') code: string) {
        await this.dropboxAuthService.callback(code);
    }

    @Get('me')
    @UseGuards(DropboxAuthGuard)
    me(): Promise<DropboxUser> {
        return this.dropboxAuthService.me();
    }

}