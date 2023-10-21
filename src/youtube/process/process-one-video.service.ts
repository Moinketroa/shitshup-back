import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { Step4Service } from './step/step-4.service';
import { ProcessTaskService } from './process-task.service';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { Step5Service } from './step/step-5.service';
import { Step2OneVideoService } from './step/step-2-one-video.service';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { Step6Service } from './step/step-6.service';
import { Step5Result } from './model/step-5-result.model';
import { Step7Service } from './step/step-7.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class ProcessOneVideoService {

    constructor(
        private readonly step2OneVideo: Step2OneVideoService,
        private readonly step4: Step4Service,
        private readonly step5: Step5Service,
        private readonly step6: Step6Service,
        private readonly step7: Step7Service,
        private readonly processTaskService: ProcessTaskService,
    ) {
    }

    async processOneVideo(youtubeUser: YoutubeUser, token: string, videoIdToProcess: string): Promise<any> {
        await this.processTaskService.initProcessMainTask(5);

        const fileInfos = await this.triggerStep2(token, videoIdToProcess);

        const musicDataAnalysisResults = await this.triggerStep4(fileInfos);

        const step5Results = await this.triggerStep5(musicDataAnalysisResults);

        await this.triggerStep6(fileInfos);

        await this.triggerStep7(step5Results);

        console.log('[PROCESS_PENDING] Process ended.');
        await this.processTaskService.completeTask();

        return {
            musicDataAnalysisResult: musicDataAnalysisResults,
        };
    }

    private async triggerStep2(token: string, videoId: string): Promise<FileInfo[]> {
        const fileInfos = await this.step2OneVideo.stepDownloadOneVideo(token, videoId);

        await this.processTaskService.incrementTasksDone();

        return fileInfos;
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
}