import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { Step1Service } from './step/step-1.service';
import { Step2Service } from './step/step-2.service';
import { Step3Service } from './step/step-3.service';
import { Step4Service } from './step/step-4.service';
import { ProcessTaskService } from './process-task.service';
import { Step2Results } from './model/step-2-results.model';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { Step5Service } from './step/step-5.service';
import { Step6Service } from './step/step-6.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class ProcessPendingService {

    constructor(
        private readonly step1: Step1Service,
        private readonly step2: Step2Service,
        private readonly step3: Step3Service,
        private readonly step4: Step4Service,
        private readonly step5: Step5Service,
        private readonly step6: Step6Service,
        private readonly processTaskService: ProcessTaskService,
    ) {
    }

    async processPending(youtubeUser: YoutubeUser, token: string): Promise<any> {
        await this.processTaskService.initProcessMainTask(6);

        const allIdsToProcess = await this.triggerStep1(youtubeUser, token);

        if (allIdsToProcess.length === 0) {
            console.log('[PROCESS_PENDING] No videos to process. Process ended.');
            await this.processTaskService.completeTask();

            return [];
        }

        const step2Results = await this.triggerStep2(token, allIdsToProcess);

        await this.triggerStep3(youtubeUser, allIdsToProcess, step2Results);

        const musicDataAnalysisResults = await this.triggerStep4(step2Results);

        await this.triggerStep5(musicDataAnalysisResults);

        await this.triggerStep6(step2Results);

        console.log('[PROCESS_PENDING] Process ended.');
        await this.processTaskService.completeTask();

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
        await this.step3.stepDeleteVideosFromPending(youtubeUser, allIdsToProcess, step2Results.idsNotDownloaded);

        await this.processTaskService.incrementTasksDone();
    }

    private async triggerStep4(step2Results: Step2Results) {
        const musicDataAnalysisResults = await this.step4.stepGetMusicInfos(step2Results.fileInfos);

        await this.processTaskService.incrementTasksDone();

        return musicDataAnalysisResults;
    }

    private async triggerStep5(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        await this.step5.stepPushResultsToNotion(musicDataAnalysisResults);

        await this.processTaskService.incrementTasksDone();
    }

    private async triggerStep6(step2Results: Step2Results) {
        await this.step6.stepGetSpleeterData(step2Results.fileInfos);

        await this.processTaskService.incrementTasksDone();
    }
}