import { BadRequestException, Injectable } from '@nestjs/common';
import { YoutubeUser } from '../../youtube/model/youtube-user.model';
import { isNullOrUndefined } from '../../util/util';
import { YoutubeClient, YoutubeClientPlaylist, YoutubeClientPlaylistResponse } from './type/youtube-client.type';
import { YoutubePlaylistMapper } from './mapper/youtube-playlist.mapper';
import { YoutubeShitshupPlaylists } from './entity/youtube-playlist.entity';
import * as process from 'process';

@Injectable()
export class YoutubePlaylistRepository {

    private readonly DEFAULT_PENDING_PLAYLIST_NAME: string;
    private readonly DEFAULT_PENDING_PLAYLIST_DESCRIPTION: string;
    private readonly DEFAULT_PROCESSED_PLAYLIST_NAME: string;
    private readonly DEFAULT_PROCESSED_PLAYLIST_DESCRIPTION: string;
    private readonly DEFAULT_WAITING_PLAYLIST_NAME: string;
    private readonly DEFAULT_WAITING_PLAYLIST_DESCRIPTION: string;

    constructor(private readonly youtubeClient: YoutubeClient,
                private readonly youtubePlaylistMapper: YoutubePlaylistMapper) {
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
            part: [ 'snippet' ],
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
            waitingPlaylist
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
            part: [ 'snippet' ],
            requestBody: {
                snippet: {
                    title,
                    description,
                },
            },
        });

        return createYoutubePlaylistsResponse.data;
    }
}