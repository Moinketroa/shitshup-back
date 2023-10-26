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
import { isDefined } from '../../../util/util';
import { NotionService } from '../../../notion/notion.service';
import { Step6Result } from '../model/step-6-result.model';
import { Task } from '../../../task/model/task.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step6Service extends AbstractStep {

    private readonly DROPBOX_UPLOAD_ERROR_WARNING_MESSAGE: string = 'Error during Dropbox upload.';
    private readonly DROPBOX_SHARING_ERROR_WARNING_MESSAGE: string = 'Error during creating shared Dropbox link.';
    private readonly NOTION_DROPBOX_LINK_ERROR_WARNING_MESSAGE: string = 'Error when linking Notion row and Dropbox link.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly dropboxService: DropboxService,
                private readonly notionService: NotionService,) {
        super(processTaskService, taskService, warningService);
    }

    async stepLinkNotionRowToUploadFileDropbox(step5Results: Step5Result[]): Promise<void> {
        await this.initStepTask(TaskCategory.STEP6, 3);

        const result = await this.triggerStepProcess(step5Results);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(step5Results: Step5Result[]): Promise<void> {
        const partialStep6Results = await this.triggerSubStepUploadTracksToDropbox(step5Results);

        const fullStep6Results = await this.triggerSubStepCreateSharedLinks(partialStep6Results);

        await this.triggerSubStepLinkDropboxFileToNotionRow(fullStep6Results);
    }

    private async triggerSubStepUploadTracksToDropbox(step5Results: Step5Result[]): Promise<Step6Result[]> {
        console.log('[PROCESS_PENDING][STEP 6] Uploading tracks to Dropbox...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB6_UPLOAD_TRACKS_TO_DROPBOX, step5Results.length);

        const uploadResults: Step6Result[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const step5Result of step5Results) {
                const dropboxFilePath = await this.uploadTrackToDropbox(
                    step5Result.musicDataAnalysisResult,
                    subTask,
                );

                if (isDefined(dropboxFilePath)) {
                    uploadResults.push({
                        ...step5Result,
                        dropboxFilePath: dropboxFilePath,
                    });
                }
            }

            console.log('[PROCESS_PENDING][STEP 6] Uploading tracks to Dropbox done.');
            return uploadResults;
        });
    }

    private async uploadTrackToDropbox(musicDataAnalysisResult: MusicDataAnalysisResult, subTask: Task) {
        try {
            return await this.dropboxService.uploadFileToCloud(musicDataAnalysisResult.fileName, musicDataAnalysisResult.filePath);
        } catch (e: any) {
            await this.createWarning(
                musicDataAnalysisResult.videoId,
                WarningType.DROPBOX_UPLOAD_ERROR,
                `${this.DROPBOX_UPLOAD_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }

    private async triggerSubStepCreateSharedLinks(step6Results: Step6Result[]): Promise<Step6Result[]> {
        console.log('[PROCESS_PENDING][STEP 6] Creating Dropbox sharing links...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB6_CREATE_SHARING_LINKS, step6Results.length);

        const results: Step6Result[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const step6Result of step6Results) {
                const directDownloadLink = await this.createSharingLink(step6Result, subTask);

                if (isDefined(directDownloadLink)) {
                    results.push({
                        ...step6Result,
                        sharingLink: directDownloadLink,
                    });
                }
            }

            console.log('[PROCESS_PENDING][STEP 6] Uploading tracks to Dropbox done.');
            return results;
        });
    }

    private async createSharingLink(step6Result: Step6Result, subTask: Task): Promise<string | undefined> {
        try {
            return await this.dropboxService.createSharingLink(step6Result.dropboxFilePath);
        } catch (e: any) {
            await this.createWarning(
                step6Result.musicDataAnalysisResult.videoId,
                WarningType.DROPBOX_CREATE_SHARING_LINK_ERROR,
                `${this.DROPBOX_SHARING_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }

    private async triggerSubStepLinkDropboxFileToNotionRow(step6Results: Step6Result[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 6] Linking Dropbox file to the corresponding Notion row...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB6_LINK_TRACKS_TO_NOTION, step6Results.length);

        return await this.runSubTask(subTask, async () => {
            for (const step6Result of step6Results) {
                await this.linkDropboxFileToNotionRow(step6Result, subTask);
            }

            console.log('[PROCESS_PENDING][STEP 6] Uploading tracks to Dropbox done.');
        });
    }

    private async linkDropboxFileToNotionRow(step6Result: Step6Result, subTask: Task) {
        try {
            return await this.notionService.linkFileToPage(step6Result.notionRowId, step6Result.sharingLink!);
        } catch (e: any) {
            await this.createWarning(
                step6Result.musicDataAnalysisResult.videoId,
                WarningType.NOTION_DROPBOX_LINK_ERROR,
                `${this.NOTION_DROPBOX_LINK_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }
}