import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { YoutubeAuthGuard } from './youtube-auth.guard';

@Controller('youtube')
@UseGuards(YoutubeAuthGuard)
export class YoutubeController {
    @Get('playlists')
    playlists(@Request() req: any): any {
        console.log('hahaha tamer');
    }
}
