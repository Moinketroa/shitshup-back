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
import { Step7Result } from '../model/step-7-result.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step7Service extends AbstractStep {

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
        await this.initStepTask(TaskCategory.STEP7, 3);

        const result = await this.triggerStepProcess(step5Results);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(step5Results: Step5Result[]): Promise<void> {
        const partialStep7Results = await this.triggerSubStepUploadTracksToDropbox(step5Results);

        const fullStep7Results = await this.triggerSubStepCreateSharedLinks(partialStep7Results);

        await this.triggerSubStepLinkDropboxFileToNotionRow(fullStep7Results);
    }

    private async triggerSubStepUploadTracksToDropbox(step5Results: Step5Result[]): Promise<Step7Result[]> {
        console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB7_UPLOAD_TRACKS_TO_DROPBOX, step5Results.length);

        const uploadResults: Step7Result[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const step5Result of step5Results) {
                const dropboxFilePath = await this.uploadTrackToDropbox(step5Result.musicDataAnalysisResult);

                if (isDefined(dropboxFilePath)) {
                    uploadResults.push({
                        ...step5Result,
                        dropboxFilePath: dropboxFilePath,
                    });
                }
            }

            console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox done.');
            return uploadResults;
        });
    }

    private async uploadTrackToDropbox(musicDataAnalysisResult: MusicDataAnalysisResult) {
        try {
            return await this.dropboxService.uploadFileToCloud(musicDataAnalysisResult.fileName, musicDataAnalysisResult.filePath);
        } catch (e: any) {
            await this.createWarning(
                musicDataAnalysisResult.videoId,
                WarningType.DROPBOX_UPLOAD_ERROR,
                `${this.DROPBOX_UPLOAD_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }

    private async triggerSubStepCreateSharedLinks(step7Results: Step7Result[]): Promise<Step7Result[]> {
        console.log('[PROCESS_PENDING][STEP 7] Creating Dropbox sharing links...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB7_CREATE_SHARING_LINKS, step7Results.length);

        const results: Step7Result[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const step7Result of step7Results) {
                const directDownloadLink = await this.createSharingLink(step7Result);

                if (isDefined(directDownloadLink)) {
                    results.push({
                        ...step7Result,
                        sharingLink: directDownloadLink,
                    });
                }
            }

            console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox done.');
            return results;
        });
    }

    private async createSharingLink(step7Result: Step7Result): Promise<string | undefined> {
        try {
            return await this.dropboxService.createSharingLink(step7Result.dropboxFilePath);
        } catch (e: any) {
            await this.createWarning(
                step7Result.musicDataAnalysisResult.videoId,
                WarningType.DROPBOX_CREATE_SHARING_LINK_ERROR,
                `${this.DROPBOX_SHARING_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }

    private async triggerSubStepLinkDropboxFileToNotionRow(step7Results: Step7Result[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 7] Linking Dropbox file to the corresponding Notion row...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB7_LINK_TRACKS_TO_NOTION, step7Results.length);

        return await this.runSubTask(subTask, async () => {
            for (const step7Result of step7Results) {
                await this.linkDropboxFileToNotionRow(step7Result);
            }

            console.log('[PROCESS_PENDING][STEP 7] Uploading tracks to Dropbox done.');
        });
    }

    private async linkDropboxFileToNotionRow(step7Result: Step7Result) {
        try {
            return await this.notionService.linkFileToPage(step7Result.notionRowId, step7Result.sharingLink!);
        } catch (e: any) {
            await this.createWarning(
                step7Result.musicDataAnalysisResult.videoId,
                WarningType.NOTION_DROPBOX_LINK_ERROR,
                `${this.NOTION_DROPBOX_LINK_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }
}