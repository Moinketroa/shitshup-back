import { Injectable } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { Step1Service } from './step-1.service';
import { Step2Service } from './step-2.service';
import { Step3Service } from './step-3.service';
import { Step5Service } from './step-5.service';

@Injectable()
export class ProcessPendingService {

    constructor(
        private readonly step1: Step1Service,
        private readonly step2: Step2Service,
        private readonly step3: Step3Service,
        private readonly step5: Step5Service,
    ) {
    }

    async processPending(youtubeUser: YoutubeUser, token: string): Promise<any> {
        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        const allIdsToProcess = await this.step1.stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(
            token,
            pendingPlaylistId,
        );

        if (allIdsToProcess.length === 0) {
            console.log('[PROCESS_PENDING] No videos to process. Process ended.');
            return [];
        }

        const step2Results = await this.step2.stepDownloadPlaylist(token, allIdsToProcess);

        await this.step3.stepMoveVideosFromPendingToProcessed(youtubeUser, allIdsToProcess, step2Results.idsNotDownloaded);


        const musicDataAnalysisResults = await this.step5.stepGetMusicInfos(step2Results.fileInfos);

        console.log('[PROCESS_PENDING] Process ended.');
        return {
            idsNotDownloaded: step2Results.idsNotDownloaded,
            musicDataAnalysisResult: musicDataAnalysisResults,
        };
    }

}