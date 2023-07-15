import { Injectable } from '@nestjs/common';
import { YoutubePlaylistRepository } from '../dao/youtube/youtube-playlist-repository.service';
import { YoutubeUser } from './model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';
import { isNullOrUndefined } from '../util/util';
import { YoutubeAuthService } from './youtube-auth.service';
import { YoutubePlaylistPreview } from '../dao/youtube/entity/youtube-playlist-preview.entity';

@Injectable()
export class YoutubeService {

    constructor(private readonly youtubePlaylistRepository: YoutubePlaylistRepository,
                private readonly youtubeAuthService: YoutubeAuthService) {
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
}
