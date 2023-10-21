import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { YoutubeService } from './youtube.service';
import { YoutubeUserParam } from '../auth/youtube-auth/youtube-user.decorator';
import { YoutubeUser } from '../auth/youtube-auth/model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';
import { YoutubePlaylistPreview } from '../dao/youtube/entity/youtube-playlist-preview.entity';
import { DropboxAuthGuard } from '../auth/dropbox-auth/guard/dropbox-auth.guard';

@Controller('youtube')
@UseGuards(AuthGuard)
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

    @Get('pending/preview')
    getPendingPreview(@YoutubeUserParam() youtubeUser: YoutubeUser): Promise<YoutubePlaylistPreview | null> {
        return this.youtubeService.getPendingPlaylistPreview(youtubeUser);
    }

    @Get('process/pending')
    @UseGuards(DropboxAuthGuard)
    processPending(@YoutubeUserParam() youtubeUser: YoutubeUser): Promise<any> {
        return this.youtubeService.triggerProcessPending(youtubeUser);
    }

    @Get('process/video/:videoId')
    @UseGuards(DropboxAuthGuard)
    processOneVideo(@YoutubeUserParam() youtubeUser: YoutubeUser, @Param('videoId') videoId: string): Promise<any> {
        return this.youtubeService.triggerProcessOneVideo(youtubeUser, videoId);
    }
}
