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
import { Step7Service } from './step/step-7.service';
import { Step5Result } from './model/step-5-result.model';
import { ProcessRequest } from './model/process-request.model';
import { Step2OneVideoService } from './step/step-2-one-video.service';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class ProcessPendingService {

    constructor(
        private readonly step1: Step1Service,
        private readonly step2: Step2Service,
        private readonly step2OneVideo: Step2OneVideoService,
        private readonly step3: Step3Service,
        private readonly step4: Step4Service,
        private readonly step5: Step5Service,
        private readonly step6: Step6Service,
        private readonly step7: Step7Service,
        private readonly processTaskService: ProcessTaskService,
    ) {
    }

    async processPending(youtubeUser: YoutubeUser, token: string, processRequest: ProcessRequest): Promise<any> {
        await this.processTaskService.initProcessMainTask(this.calculateTotalSteps(processRequest));

        const fileInfos = await this.triggerFirstsSteps(youtubeUser, token, processRequest);

        if (fileInfos.length === 0) {
            console.log('[PROCESS_PENDING] No videos to process. Process ended.');
            await this.processTaskService.completeTask();

            return [];
        }

        if (processRequest.doFetchMusicAnalysisData) {
            const musicDataAnalysisResults = await this.triggerStep4(fileInfos);

            if (processRequest.doPushResultsToNotion) {
                const step5Results = await this.triggerStep5(musicDataAnalysisResults);

                if (processRequest.doLinkNotionToDropbox) {
                    await this.triggerStep7(step5Results);
                }
            }

            if (processRequest.doPredictStems) {
                await this.triggerStep6(fileInfos);
            }
        }

        console.log('[PROCESS_PENDING] Process ended.');
        await this.processTaskService.completeTask();
    }

    private async triggerFirstsSteps(youtubeUser: YoutubeUser, token: string, processRequest: ProcessRequest) {
        if (processRequest.processOneVideo) {
            return await this.triggerStep2OneVideo(token, processRequest.uniqueVideoId);
        } else {
            const allIdsToProcess = await this.triggerStep1(youtubeUser, token, processRequest.doDeleteExplicitDuplicates);

            if (allIdsToProcess.length === 0) {
                return [];
            }

            const step2Results = await this.triggerStep2(token, allIdsToProcess);

            if (processRequest.doDeleteFromPending) {
                await this.triggerStep3(youtubeUser, allIdsToProcess, step2Results);
            }

            return step2Results.fileInfos;
        }
    }

    private async triggerStep1(youtubeUser: YoutubeUser, token: string, doDeleteExplicitDuplicates: boolean) {
        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        const allIdsToProcess = await this.step1.stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(
            token,
            pendingPlaylistId,
            doDeleteExplicitDuplicates
        );

        await this.processTaskService.incrementTasksDone();

        return allIdsToProcess;
    }

    private async triggerStep2(token: string, allIdsToProcess: string[]): Promise<Step2Results> {
        const step2Results = await this.step2.stepDownloadPlaylist(token, allIdsToProcess);

        await this.processTaskService.incrementTasksDone();

        return step2Results;
    }

    private async triggerStep2OneVideo(token: string, videoId: string): Promise<FileInfo[]> {
        const fileInfos = await this.step2OneVideo.stepDownloadOneVideo(token, videoId);

        await this.processTaskService.incrementTasksDone();

        return fileInfos;
    }

    private async triggerStep3(youtubeUser: YoutubeUser, allIdsToProcess: string[], step2Results: Step2Results) {
        await this.step3.stepDeleteVideosFromPending(youtubeUser, allIdsToProcess, step2Results.idsNotDownloaded);

        await this.processTaskService.incrementTasksDone();
    }

    private async triggerStep4(fileInfos: FileInfo[]) {
        const musicDataAnalysisResults = await this.step4.stepGetMusicInfos(fileInfos);

        await this.processTaskService.incrementTasksDone();

        return musicDataAnalysisResults;
    }

    private async triggerStep5(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<Step5Result[]> {
        const step5Results = await this.step5.stepPushResultsToNotion(musicDataAnalysisResults);

        await this.processTaskService.incrementTasksDone();

        return step5Results;
    }

    private async triggerStep6(fileInfos: FileInfo[]) {
        await this.step6.stepGetSpleeterData(fileInfos);

        await this.processTaskService.incrementTasksDone();
    }

    private async triggerStep7(step5Results: Step5Result[]) {
        await this.step7.stepLinkNotionRowToUploadFileDropbox(step5Results);

        await this.processTaskService.incrementTasksDone();
    }

    private calculateTotalSteps(processRequest: ProcessRequest) {
        // STEP 2 Is mandatory
        let stepNumber: number = 1;

        if (processRequest.doLinkNotionToDropbox) {
            stepNumber++;
        }
        if (processRequest.doPredictStems) {
            stepNumber++;
        }
        if (processRequest.doPushResultsToNotion) {
            stepNumber++;
        }
        if (processRequest.doFetchMusicAnalysisData) {
            stepNumber++;
        }
        if (processRequest.doDeleteFromPending) {
            stepNumber++;
        }
        if (!processRequest.processOneVideo) {
            stepNumber++
        }

        return stepNumber;
    }
}