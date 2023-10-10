import { Injectable } from '@nestjs/common';
import { YoutubeUser } from '../model/youtube-user.model';
import {
    YoutubeDownloaderPythonRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';

@Injectable()
export class Step3Service {

    constructor(private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
    }

    async stepMoveVideosFromPendingToProcessed(
        youtubeUser: YoutubeUser,
        allIdsToProcess: string[],
        notDownloadedIds: string[],
    ): Promise<void> {
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