import { Injectable, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { WarningService } from '../../../warning/warning.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { DropboxService } from '../../../dropbox/dropbox.service';
import { Step5Result } from '../model/step-5-result.model';
import { MusicDataAnalysisResult } from '../model/music-data-analysis-result.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step7Service extends AbstractStep {

    private readonly DROPBOX_ERROR_WARNING_MESSAGE: string = 'Error during Dropbox upload.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly dropboxService: DropboxService, ) {
        super(processTaskService, taskService, warningService);
    }

    async stepUploadTrackToDropbox(step5Results: Step5Result[]): Promise<void> {
        await this.initStepTask(TaskCategory.STEP7, 1);

        const result = await this.triggerStepProcess(step5Results);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(step5Results: Step5Result[]): Promise<void> {
        return await this.triggerSubStepUploadTracksToDropbox(step5Results);
    }

    private async triggerSubStepUploadTracksToDropbox(step5Results: Step5Result[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB7_UPLOAD_TRACKS_TO_DROPBOX, step5Results.length);

        return await this.runSubTask(subTask, async () => {
            for (const step5Result of step5Results) {
                await this.uploadTrackToDropbox(step5Result.musicDataAnalysisResult);
            }

            console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox done.');
        });
    }

    private async uploadTrackToDropbox(musicDataAnalysisResult: MusicDataAnalysisResult) {
        try {
            await this.dropboxService.uploadFileToCloud(musicDataAnalysisResult.fileName, musicDataAnalysisResult.filePath);
        } catch (e: any) {
            await this.createWarning(
                musicDataAnalysisResult.videoId,
                WarningType.DROPBOX_UPLOAD_ERROR,
                `${this.DROPBOX_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }
}