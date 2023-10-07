import { Injectable } from '@nestjs/common';
import { YoutubePlaylistRepository } from '../dao/youtube/youtube-playlist-repository.service';
import { YoutubeUser } from './model/youtube-user.model';
import { YoutubeShitshupPlaylists } from '../dao/youtube/entity/youtube-playlist.entity';
import { isNullOrUndefined } from '../util/util';
import { YoutubeAuthService } from './youtube-auth.service';
import { YoutubePlaylistPreview } from '../dao/youtube/entity/youtube-playlist-preview.entity';
import { YoutubeDownloaderPythonRepository } from '../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class YoutubeService {

    constructor(private readonly oAuth2Client: OAuth2Client,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
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

    async processPending(youtubeUser: YoutubeUser): Promise<any> {
        const tokenRes = await this.oAuth2Client.getAccessToken();
        const token = tokenRes.token as string;
        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        const allIdsToProcess = await this.stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(
            token,
            pendingPlaylistId,
        );

        if (allIdsToProcess.length === 0) {
            console.log('[PROCESS_PENDING] No videos to process. Process ended.');
            return [];
        }

        const notDownloadedIds = await this.stepDownloadPlaylist(token, allIdsToProcess);

        await this.stepMoveVideosFromPendingToProcessed(youtubeUser, allIdsToProcess, notDownloadedIds);

        console.log('[PROCESS_PENDING] Process ended.');
        return notDownloadedIds;
    }

    private async stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(token: string, playlistId: string): Promise<string[]> {
        console.log('[PROCESS_PENDING][STEP 1] Fetching IDs of playlist');
        const allIdsToProcess = await this.youtubeDownloaderPythonRepository.listAllIdsOfPlaylist(
            token,
            playlistId,
        );

        console.log('[PROCESS_PENDING][STEP 1] Check for explicit duplicates');
        const allIdsNotDownloaded = await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(
            token,
            allIdsToProcess,
        );

        const allExplicitDuplicatesIds = allIdsToProcess.filter(
            (idToProcess) => !allIdsNotDownloaded.includes(idToProcess),
        );

        if (allExplicitDuplicatesIds.length !== 0) {
            console.log(
                '[PROCESS_PENDING][STEP 1] Explicit duplicates found. Excluding from processing and deleting from Pending playlist...',
            );
            await this.youtubePlaylistRepository.deleteIdsFromPlaylist(playlistId, allExplicitDuplicatesIds);
            console.log('[PROCESS_PENDING][STEP 1] Explicit duplicates deleted from playlist');
        } else {
            console.log('[PROCESS_PENDING][STEP 1] No Explicit duplicates found.');
        }

        console.log('[PROCESS_PENDING][STEP 1] List of videos to process established.');
        return allIdsNotDownloaded;
    }

    private async stepDownloadPlaylist(token: string, allIdsToProcess: string[]): Promise<string[]> {
        console.log('[PROCESS_PENDING][STEP 2] Downloading...');
        await this.youtubeDownloaderPythonRepository.downloadPlaylist(token, allIdsToProcess);
        console.log('[PROCESS_PENDING][STEP 2] Download finished');
        const notDownloaded = await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(token, allIdsToProcess);

        if (notDownloaded.length === 0) {
            console.log('[PROCESS_PENDING][STEP 2] Success : All videos downloaded');
        } else {
            console.log('[PROCESS_PENDING][STEP 2] Videos ids not downloaded : ', notDownloaded.join(' '));
        }

        return notDownloaded;
    }

    private async stepMoveVideosFromPendingToProcessed(
        youtubeUser: YoutubeUser,
        allIdsToProcess: string[],
        notDownloadedIds: string[],
    ): Promise<any> {
        const allDownloadedIds = allIdsToProcess.filter(
            (idToProcess) => !notDownloadedIds.includes(idToProcess),
        );

        if (allDownloadedIds.length !== 0) {
            console.log('[PROCESS_PENDING][STEP 3] Moving videos from pending playlist to processed playlist.');
            console.log('[PROCESS_PENDING][STEP 3] Deleting videos from pending playlist.');
            await this.youtubePlaylistRepository.deleteIdsFromPlaylist(youtubeUser.pendingPlaylistId, allDownloadedIds);
            console.log('[PROCESS_PENDING][STEP 3] Deleting done. Proceeding to adding videos to processed playlist.');
            await this.youtubePlaylistRepository.addIdsToPlaylist(youtubeUser.processedPlaylistId, allDownloadedIds);
            console.log('[PROCESS_PENDING][STEP 3] Videos added to processed playlist.');
            console.log('[PROCESS_PENDING][STEP 3] Moving done.');
        }
    }
}
