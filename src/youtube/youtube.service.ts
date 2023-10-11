import { Injectable } from '@nestjs/common';
import { YoutubePlaylistRepository } from '../dao/youtube/youtube-playlist-repository.service';
import { YoutubeUser } from '../auth/youtube-auth/model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';
import { isNullOrUndefined } from '../util/util';
import { YoutubeAuthService } from '../auth/youtube-auth/youtube-auth.service';
import { YoutubePlaylistPreview } from '../dao/youtube/entity/youtube-playlist-preview.entity';
import { OAuth2Client } from 'google-auth-library';
import { ProcessPendingService } from './process-pending/process-pending.service';

@Injectable()
export class YoutubeService {

    constructor(private readonly oAuth2Client: OAuth2Client,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository,
                private readonly youtubeAuthService: YoutubeAuthService,
                private readonly processPendingService: ProcessPendingService) {
    }

    getPlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists | null> {
        return this.youtubePlaylistRepository.getYoutubePlaylists(youtubeUser);
    }

    async generatePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists> {
        const youtubePlaylists: YoutubeShitshupPlaylists | null = await this.youtubePlaylistRepository.getYoutubePlaylists(youtubeUser);

        if (isNullOrUndefined(youtubePlaylists)) {
            const newYoutubePlaylists: YoutubeShitshupPlaylists = await this.youtubePlaylistRepository.createYoutubePlaylists();

            await this.youtubeAuthService.updateUserPlaylists(
                youtubeUser,
                newYoutubePlaylists.pendingPlaylist.id,
                newYoutubePlaylists.processedPlaylist.id,
                newYoutubePlaylists.waitingPlaylist.id,
            );

            return newYoutubePlaylists;
        } else {
            return youtubePlaylists;
        }
    }

    getPendingPlaylistPreview(youtubeUser: YoutubeUser): Promise<YoutubePlaylistPreview | null> {
        return this.youtubePlaylistRepository.getPendingPlaylistPreview(youtubeUser);
    }

    async triggerProcessPending(youtubeUser: YoutubeUser): Promise<any> {
        const tokenRes = await this.oAuth2Client.getAccessToken();
        const token = tokenRes.token as string;

        return this.processPendingService.processPending(youtubeUser, token);
    }
}
