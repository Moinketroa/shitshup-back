import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { YoutubeAuthGuard } from './youtube-auth.guard';
import { YoutubeService } from './youtube.service';
import { YoutubeUserParam } from './youtube-user.decorator';
import { YoutubeUser } from './model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';

@Controller('youtube')
@UseGuards(YoutubeAuthGuard)
export class YoutubeController {

    constructor(private readonly youtubeService: YoutubeService) {
    }

    @Get('playlists')
    getPlaylists(@YoutubeUserParam() youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists | null> {
        return this.youtubeService.getPlaylists(youtubeUser);
    }

    @Post('playlists')
    postPlaylists(@YoutubeUserParam() youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists> {
        return this.youtubeService.generatePlaylists(youtubeUser);
    }
}
