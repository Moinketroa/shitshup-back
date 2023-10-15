import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { Step1Service } from './step-1.service';
import { Step2Service } from './step-2.service';
import { Step3Service } from './step-3.service';
import { Step5Service } from './step-5.service';
import { ProcessTaskService } from './process-task.service';
import { Step2Results } from './model/step-2-results.model';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { Step6Service } from './step-6.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class ProcessPendingService {

    constructor(
        private readonly step1: Step1Service,
        private readonly step2: Step2Service,
        private readonly step3: Step3Service,
        private readonly step5: Step5Service,
        private readonly step6: Step6Service,
        private readonly processTaskService: ProcessTaskService,
    ) {
    }

    async processPending(youtubeUser: YoutubeUser, token: string): Promise<any> {
        await this.processTaskService.initProcessMainTask(5);

        const allIdsToProcess = await this.triggerStep1(youtubeUser, token);

        if (allIdsToProcess.length === 0) {
            console.log('[PROCESS_PENDING] No videos to process. Process ended.');
            return [];
        }

        const step2Results = await this.triggerStep2(token, allIdsToProcess);

        await this.triggerStep3(youtubeUser, allIdsToProcess, step2Results);

        const musicDataAnalysisResults = await this.triggerStep5(step2Results);

        await this.triggerStep6(musicDataAnalysisResults);

        console.log('[PROCESS_PENDING] Process ended.');
        return {
            idsNotDownloaded: step2Results.idsNotDownloaded,
            musicDataAnalysisResult: musicDataAnalysisResults,
        };
    }

    private async triggerStep1(youtubeUser: YoutubeUser, token: string) {
        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        const allIdsToProcess = await this.step1.stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(
            token,
            pendingPlaylistId,
        );

        await this.processTaskService.incrementTasksDone();

        return allIdsToProcess;
    }

    private async triggerStep2(token: string, allIdsToProcess: string[]): Promise<Step2Results> {
        const step2Results = await this.step2.stepDownloadPlaylist(token, allIdsToProcess);

        await this.processTaskService.incrementTasksDone();

        return step2Results;
    }

    private async triggerStep3(youtubeUser: YoutubeUser, allIdsToProcess: string[], step2Results: Step2Results) {
        await this.step3.stepMoveVideosFromPendingToProcessed(youtubeUser, allIdsToProcess, step2Results.idsNotDownloaded);

        await this.processTaskService.incrementTasksDone();
    }

    private async triggerStep5(step2Results: Step2Results) {
        const musicDataAnalysisResults = await this.step5.stepGetMusicInfos(step2Results.fileInfos);

        await this.processTaskService.incrementTasksDone();

        return musicDataAnalysisResults;
    }

    private async triggerStep6(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        await this.step6.stepPushResultsToNotion(musicDataAnalysisResults);

        await this.processTaskService.incrementTasksDone();
    }
}