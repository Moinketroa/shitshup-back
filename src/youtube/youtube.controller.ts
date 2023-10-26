import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { YoutubeService } from './youtube.service';
import { YoutubeUserParam } from '../auth/youtube-auth/youtube-user.decorator';
import { YoutubeUser } from '../auth/youtube-auth/model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';
import { YoutubePlaylistPreview } from '../dao/youtube/entity/youtube-playlist-preview.entity';
import { DropboxAuthGuard } from '../auth/dropbox-auth/guard/dropbox-auth.guard';
import { ProcessRequest } from './process/model/process-request.model';

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

    @Post('process')
    @UseGuards(DropboxAuthGuard)
    processPending(@YoutubeUserParam() youtubeUser: YoutubeUser, @Body() processRequest: ProcessRequest): Promise<any> {
        ProcessRequest.validateProcessRequest(processRequest);

        return this.youtubeService.triggerProcess(youtubeUser, processRequest);
    }
}
