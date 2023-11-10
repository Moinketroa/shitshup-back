import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { isNullOrUndefined } from '../../util/util';
import {
    YoutubeClient,
    YoutubeClientPlaylist, YoutubeClientPlaylistItem,
    YoutubeClientPlaylistItemResponse,
    YoutubeClientPlaylistResponse,
} from './type/youtube-client.type';
import { YoutubePlaylistMapper } from './mapper/youtube-playlist.mapper';
import { YoutubeShitshupPlaylists } from './entity/youtube-playlist.entity';
import * as process from 'process';
import { YoutubePlaylistPreviewMapper } from './mapper/youtube-playlist-preview.mapper';
import { YoutubePlaylistPreview } from './entity/youtube-playlist-preview.entity';
import { YoutubePart } from './type/youtube-part.enum';

@Injectable()
export class YoutubePlaylistRepository {

    private readonly logger = new Logger(YoutubePlaylistRepository.name);

    private readonly DEFAULT_PENDING_PLAYLIST_NAME: string;
    private readonly DEFAULT_PENDING_PLAYLIST_DESCRIPTION: string;

    constructor(
        private readonly youtubeClient: YoutubeClient,
        private readonly youtubePlaylistMapper: YoutubePlaylistMapper,
        private readonly youtubePlaylistPreviewMapper: YoutubePlaylistPreviewMapper,
    ) {
        this.DEFAULT_PENDING_PLAYLIST_NAME = process.env.YOUTUBE_DEFAULT_PENDING_PLAYLIST_NAME || '';
        this.DEFAULT_PENDING_PLAYLIST_DESCRIPTION = process.env.YOUTUBE_DEFAULT_PENDING_PLAYLIST_DESCRIPTION || '';
    }

    async getYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists | null> {
        if (isNullOrUndefined(youtubeUser.pendingPlaylistId)) {
            return null;
        } else {
            return this.fetchAndMapYoutubePlaylists(youtubeUser);
        }
    }

    private async fetchAndMapYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists> {
        const youtubeUserPlaylistsResponse: YoutubeClientPlaylistResponse = await this.fetchYoutubePlaylists(youtubeUser);

        const youtubeUserPlaylists: YoutubeClientPlaylist[] = youtubeUserPlaylistsResponse?.items ?? [];

        const pendingPlaylist: YoutubeClientPlaylist | undefined = this.findPlaylistById(youtubeUserPlaylists, youtubeUser.pendingPlaylistId);

        return this.mapPlaylists(pendingPlaylist);
    }

    private async fetchYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeClientPlaylistResponse> {
        const youtubePlaylistsIds: string[] = [
            youtubeUser.pendingPlaylistId,
        ];

        const youtubePlaylistsResponse = await this.youtubeClient.playlists.list({
            part: [ YoutubePart.SNIPPET ],
            id: youtubePlaylistsIds,
            maxResults: youtubePlaylistsIds.length,
        });

        return youtubePlaylistsResponse.data;
    }

    private findPlaylistById(
        playlists: YoutubeClientPlaylist[],
        playlistId: string,
    ): YoutubeClientPlaylist | undefined {
        return playlists.find((playlist: YoutubeClientPlaylist) => playlist.id === playlistId);
    }

    private mapPlaylists(
        pendingPlaylist?: YoutubeClientPlaylist,
    ): YoutubeShitshupPlaylists {
        if (isNullOrUndefined(pendingPlaylist)) {
            throw new BadRequestException(`Id provided for the playlist don't refer to an actual playlist`);
        } else {
            return this.youtubePlaylistMapper.mapToYoutubeShitshupPlaylists(
                pendingPlaylist,
            );
        }
    }

    async createYoutubePlaylists(): Promise<YoutubeShitshupPlaylists> {
        const pendingPlaylist = await this.createYoutubePlaylist(
            this.DEFAULT_PENDING_PLAYLIST_NAME,
            this.DEFAULT_PENDING_PLAYLIST_DESCRIPTION,
        );

        return this.mapPlaylists(pendingPlaylist);
    }

    private async createYoutubePlaylist(title: string, description: string): Promise<YoutubeClientPlaylist> {
        const createYoutubePlaylistsResponse = await this.youtubeClient.playlists.insert({
            part: [ YoutubePart.SNIPPET ],
            requestBody: {
                snippet: {
                    title,
                    description,
                },
            },
        });

        return createYoutubePlaylistsResponse.data;
    }

    async getPendingPlaylistPreview(youtubeUser: YoutubeUser): Promise<YoutubePlaylistPreview | null> {
        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        if (!pendingPlaylistId) {
            return null;
        } else {
            const playListPreviewResponse: YoutubeClientPlaylistItemResponse = await this.getPlaylistPreview(pendingPlaylistId);

            return this.youtubePlaylistPreviewMapper.map(pendingPlaylistId, playListPreviewResponse);
        }
    }

    async deleteIdFromPlaylist(playlistId: string, idToDelete: string): Promise<void> {
        this.logger.log(`Searching for ${ idToDelete } videos playlistItem`);
        const playlistItemToDelete: YoutubeClientPlaylistItem | null = await this.fetchPlaylistItemToDelete(
            playlistId,
            idToDelete,
        );

        if (isNullOrUndefined(playlistItemToDelete)) {
            throw new Error('Playlist Item to delete can\'t be found. Did you already delete it ?');
        }

        this.logger.log(`Deleting video from playlist ${ playlistId }`);
        await this.removePlaylistItem(playlistId, playlistItemToDelete);
    }

    private async getPlaylistPreview(playlistId: string): Promise<YoutubeClientPlaylistItemResponse> {
        const playListPreviewResponse = await this.youtubeClient.playlistItems.list({
            part: [ YoutubePart.SNIPPET ],
            playlistId,
        });

        return playListPreviewResponse.data;
    }

    private async getPlaylistPage(playlistId: string, pageToken?: string): Promise<YoutubeClientPlaylistItemResponse> {
        const playListPageResponse = await this.youtubeClient.playlistItems.list({
            part: [ YoutubePart.CONTENT_DETAILS ],
            playlistId,
            maxResults: 50,
            pageToken,
        });

        return playListPageResponse.data;
    }

    private async fetchPlaylistItemToDelete(playlistId: string, idsToDelete: string): Promise<YoutubeClientPlaylistItem | null> {
        let playlistPage: YoutubeClientPlaylistItemResponse;
        let playlistItems: YoutubeClientPlaylistItem[];
        let nextPageToken: string | null | undefined = undefined;

        do {
            this.logger.log(`Fetching playlist page`);
            playlistPage = await this.getPlaylistPage(playlistId, nextPageToken);

            playlistItems = playlistPage.items ?? [];
            nextPageToken = playlistPage.nextPageToken;

            for (let i = 0; i < playlistItems.length; i++) {
                const playlistItem: YoutubeClientPlaylistItem = playlistItems[i];
                const videoId = <string>playlistItem?.contentDetails?.videoId;

                if (idsToDelete === videoId) {
                    return playlistItem;
                }
            }
        } while (!!nextPageToken);

        return null;
    }

    private async removePlaylistItem(playlistId: string, playlistItem: YoutubeClientPlaylistItem): Promise<void> {
        if (isNullOrUndefined(playlistItem?.id)) {
            throw new Error('Video Id is not defined');
        }

        this.logger.log(`Deleting video ${ playlistItem.contentDetails?.videoId } from playlist ${ playlistId }`);
        await this.youtubeClient.playlistItems.delete({
            id: playlistItem.id,
        });
        this.logger.log(`Video ${ playlistItem.contentDetails?.videoId } deleted`);
    }
}