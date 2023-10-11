import { BadRequestException, Injectable } from '@nestjs/common';
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
import { pull } from 'lodash';
import { YoutubePart } from './type/youtube-part.enum';
import { YoutubeRessourceKind } from './type/youtube-ressource-kind.enum';

@Injectable()
export class YoutubePlaylistRepository {

    private readonly DEFAULT_PENDING_PLAYLIST_NAME: string;
    private readonly DEFAULT_PENDING_PLAYLIST_DESCRIPTION: string;
    private readonly DEFAULT_PROCESSED_PLAYLIST_NAME: string;
    private readonly DEFAULT_PROCESSED_PLAYLIST_DESCRIPTION: string;
    private readonly DEFAULT_WAITING_PLAYLIST_NAME: string;
    private readonly DEFAULT_WAITING_PLAYLIST_DESCRIPTION: string;

    constructor(
        private readonly youtubeClient: YoutubeClient,
        private readonly youtubePlaylistMapper: YoutubePlaylistMapper,
        private readonly youtubePlaylistPreviewMapper: YoutubePlaylistPreviewMapper,
    ) {
        this.DEFAULT_PENDING_PLAYLIST_NAME = process.env.YOUTUBE_DEFAULT_PENDING_PLAYLIST_NAME || '';
        this.DEFAULT_PENDING_PLAYLIST_DESCRIPTION = process.env.YOUTUBE_DEFAULT_PENDING_PLAYLIST_DESCRIPTION || '';
        this.DEFAULT_PROCESSED_PLAYLIST_NAME = process.env.YOUTUBE_DEFAULT_PROCESSED_PLAYLIST_NAME || '';
        this.DEFAULT_PROCESSED_PLAYLIST_DESCRIPTION = process.env.YOUTUBE_DEFAULT_PROCESSED_PLAYLIST_DESCRIPTION || '';
        this.DEFAULT_WAITING_PLAYLIST_NAME = process.env.YOUTUBE_DEFAULT_WAITING_PLAYLIST_NAME || '';
        this.DEFAULT_WAITING_PLAYLIST_DESCRIPTION = process.env.YOUTUBE_DEFAULT_WAITING_PLAYLIST_DESCRIPTION || '';
    }

    async getYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists | null> {
        if (
            isNullOrUndefined(youtubeUser.pendingPlaylistId) ||
            isNullOrUndefined(youtubeUser.processedPlaylistId) ||
            isNullOrUndefined(youtubeUser.waitingPlaylistId)
        ) {
            // one of the playlist is missing => simple interpretation : no playlists, return nothing
            return null;
        } else {
            return this.fetchAndMapYoutubePlaylists(youtubeUser);
        }
    }

    private async fetchAndMapYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeShitshupPlaylists> {
        const youtubeUserPlaylistsResponse: YoutubeClientPlaylistResponse = await this.fetchYoutubePlaylists(youtubeUser);

        const youtubeUserPlaylists: YoutubeClientPlaylist[] = youtubeUserPlaylistsResponse?.items ?? [];

        const pendingPlaylist: YoutubeClientPlaylist | undefined = this.findPlaylistById(youtubeUserPlaylists, youtubeUser.pendingPlaylistId);
        const processedPlaylist: YoutubeClientPlaylist | undefined = this.findPlaylistById(youtubeUserPlaylists, youtubeUser.processedPlaylistId);
        const waitingPlaylist: YoutubeClientPlaylist | undefined = this.findPlaylistById(youtubeUserPlaylists, youtubeUser.waitingPlaylistId);

        return this.mapPlaylists(pendingPlaylist, processedPlaylist, waitingPlaylist);
    }

    private async fetchYoutubePlaylists(youtubeUser: YoutubeUser): Promise<YoutubeClientPlaylistResponse> {
        const youtubePlaylistsIds: string[] = [
            youtubeUser.pendingPlaylistId,
            youtubeUser.processedPlaylistId,
            youtubeUser.waitingPlaylistId,
        ];

        const youtubePlaylistsResponse = await this.youtubeClient.playlists.list({
            part: [YoutubePart.SNIPPET],
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
        processedPlaylist?: YoutubeClientPlaylist,
        waitingPlaylist?: YoutubeClientPlaylist,
    ): YoutubeShitshupPlaylists {
        if (
            isNullOrUndefined(pendingPlaylist) ||
            isNullOrUndefined(processedPlaylist) ||
            isNullOrUndefined(waitingPlaylist)
        ) {
            throw new BadRequestException(`Ids provided for the playlists don't refer to actual playlists`);
        } else {
            return this.youtubePlaylistMapper.mapToYoutubeShitshupPlaylists(
                pendingPlaylist,
                processedPlaylist,
                waitingPlaylist,
            );
        }
    }

    async createYoutubePlaylists(): Promise<YoutubeShitshupPlaylists> {
        const [
            pendingPlaylist,
            processedPlaylist,
            waitingPlaylist,
        ] = await Promise.all([
            this.createYoutubePlaylist(
                this.DEFAULT_PENDING_PLAYLIST_NAME,
                this.DEFAULT_PENDING_PLAYLIST_DESCRIPTION,
            ),
            this.createYoutubePlaylist(
                this.DEFAULT_PROCESSED_PLAYLIST_NAME,
                this.DEFAULT_PROCESSED_PLAYLIST_DESCRIPTION,
            ),
            this.createYoutubePlaylist(
                this.DEFAULT_WAITING_PLAYLIST_NAME,
                this.DEFAULT_WAITING_PLAYLIST_DESCRIPTION,
            ),
        ]);

        return this.mapPlaylists(pendingPlaylist, processedPlaylist, waitingPlaylist);
    }

    private async createYoutubePlaylist(title: string, description: string): Promise<YoutubeClientPlaylist> {
        const createYoutubePlaylistsResponse = await this.youtubeClient.playlists.insert({
            part: [YoutubePart.SNIPPET],
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

    async deleteIdsFromPlaylist(playlistId: string, idsToDelete: string[]): Promise<void> {
        console.log(`[YoutubePlaylistRepository] Searching for ${idsToDelete.length} videos to delete`);
        const playlistItemsToDelete: YoutubeClientPlaylistItem[] = await this.fetchPlaylistItemToDelete(
            playlistId,
            idsToDelete,
        );

        console.log(`[YoutubePlaylistRepository] Deleting video(s) from playlist ${playlistId}`);
        for (const playlistItem of playlistItemsToDelete) {
            await this.removePlaylistItem(playlistId, playlistItem);
        }
    }

    async addIdsToPlaylist(playlistId: string, idsToInsert: string[]): Promise<void> {
        console.log(`[YoutubePlaylistRepository] Adding video(s) to playlist ${playlistId}`);
        for (const idToInsert of idsToInsert) {
            await this.addIdToPlaylist(playlistId, idToInsert);
        }
    }

    async addIdToPlaylist(playlistId: string, idToInsert: string): Promise<void> {
        console.log(`[YoutubePlaylistRepository] Adding video ${idToInsert} to playlist ${playlistId}`);

        await this.youtubeClient.playlistItems.insert({
            part: [YoutubePart.SNIPPET],
            requestBody: {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: YoutubeRessourceKind.VIDEO,
                        videoId: idToInsert,
                    },
                },
            },
        });

        console.log(`[YoutubePlaylistRepository] Video ${idToInsert} added`);
    }

    private async getPlaylistPreview(playlistId: string): Promise<YoutubeClientPlaylistItemResponse> {
        const playListPreviewResponse = await this.youtubeClient.playlistItems.list({
            part: [YoutubePart.SNIPPET],
            playlistId,
        });

        return playListPreviewResponse.data;
    }

    private async getPlaylistPage(playlistId: string, pageToken?: string): Promise<YoutubeClientPlaylistItemResponse> {
        const playListPageResponse = await this.youtubeClient.playlistItems.list({
            part: [YoutubePart.CONTENT_DETAILS],
            playlistId,
            maxResults: 50,
            pageToken,
        });

        return playListPageResponse.data;
    }

    private async fetchPlaylistItemToDelete(playlistId: string, idsToDelete: string[]): Promise<YoutubeClientPlaylistItem[]> {
        const idsToDeleteArray = [...idsToDelete];
        const playlistItemsToDelete: YoutubeClientPlaylistItem[] = [];

        let playlistPage: YoutubeClientPlaylistItemResponse;
        let playlistItems: YoutubeClientPlaylistItem[];
        let nextPageToken: string | null | undefined = undefined;

        do {
            console.log(`[YoutubePlaylistRepository] Fetching playlist page`);
            playlistPage = await this.getPlaylistPage(playlistId, nextPageToken);

            playlistItems = playlistPage.items ?? [];
            nextPageToken = playlistPage.nextPageToken;

            for (let i = 0; i < playlistItems.length; i++) {
                const playlistItem: YoutubeClientPlaylistItem = playlistItems[i];
                const videoId = <string>playlistItem?.contentDetails?.videoId;

                if (idsToDeleteArray.includes(videoId)) {
                    playlistItemsToDelete.push(playlistItem);

                    pull(idsToDeleteArray, videoId);

                    if (idsToDeleteArray.length === 0) {
                        break;
                    }
                }
            }
        } while (!!nextPageToken && idsToDeleteArray.length !== 0);

        return playlistItemsToDelete;
    }

    private async removePlaylistItem(playlistId: string, playlistItem: YoutubeClientPlaylistItem): Promise<void> {
        console.log(
            `[YoutubePlaylistRepository] Deleting video ${playlistItem.contentDetails?.videoId} from playlist ${playlistId}`,
        );
        await this.youtubeClient.playlistItems.delete({
            id: playlistItem.id!,
        });
        console.log(`[YoutubePlaylistRepository] Video ${playlistItem.contentDetails?.videoId} deleted`);
    }
}