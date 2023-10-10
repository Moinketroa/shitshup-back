import { Injectable } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';

@Injectable()
export class Step1Service {

    constructor(private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
    }

    async stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(token: string, playlistId: string): Promise<string[]> {
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

}