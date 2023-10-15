import { Injectable, Scope } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository,
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import {
    YoutubeDownloaderPythonFileInfoRepository,
} from '../../dao/youtube-downloader-python/youtube-downloader-python-file-info.repository';
import { Step2Results } from './model/step-2-results.model';
import * as fs from 'fs';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { WarningService } from '../../warning/warning.service';
import { WarningType } from '../../warning/mapper/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step2Service extends AbstractStep {

    private readonly NOT_DOWNLOADED_WARNING_MESSAGE: string = '[Step 2] Video not downloaded. Perhaps its not available anymore.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubeDownloaderPythonFileInfoRepository: YoutubeDownloaderPythonFileInfoRepository,) {
        super(processTaskService, taskService, warningService);
    }

    async stepDownloadPlaylist(token: string, allIdsToProcess: string[]): Promise<Step2Results> {
        await this.initStepTask(TaskCategory.STEP2, 4);

        const result = await this.triggerStepProcess(token, allIdsToProcess);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(token: string, allIdsToProcess: string[]) {
        const filesDownloadedInfoFilepath = await this.triggerSubStepDownloadPlaylist(token, allIdsToProcess);

        const fileInfos = await this.triggerSubStepParseFileInfos(filesDownloadedInfoFilepath);

        await this.triggerSubStepDeleteFileInfoTempFile(filesDownloadedInfoFilepath);

        const notDownloaded = await this.triggerSubStepGetIdsNotDownloaded(token, allIdsToProcess);

        return <Step2Results>{
            idsNotDownloaded: notDownloaded,
            fileInfos: fileInfos,
        }
    }

    private async triggerSubStepDownloadPlaylist(token: string, allIdsToProcess: string[]): Promise<string> {
        console.log('[PROCESS_PENDING][STEP 2] Downloading...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_DOWNLOAD_PLAYLIST, allIdsToProcess.length);

        return await this.runSubTask(subTask, async () => {
            const filesDownloadedInfoFilepath = await this.youtubeDownloaderPythonRepository.downloadPlaylist(token, allIdsToProcess);
            console.log('[PROCESS_PENDING][STEP 2] Download finished');

            return filesDownloadedInfoFilepath;
        });
    }

    private async triggerSubStepParseFileInfos(filesDownloadedInfoFilepath: string): Promise<FileInfo[]> {
        console.log('[PROCESS_PENDING][STEP 2] Parsing downloaded videos infos');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_PARSE_FILE_INFOS, 1);

        return await this.runSubTask(subTask, async () => {
            return await this.youtubeDownloaderPythonFileInfoRepository.getFileInfos(
                filesDownloadedInfoFilepath,
                () => {
                    this.progressTask(subTask);
                },
            );
        });
    }

    private async triggerSubStepDeleteFileInfoTempFile(filesDownloadedInfoFilepath: string): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 2] Deleting Videos info temp file');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_DELETE_FILE_INFO_TEMP_FILE, 1);

        return await this.runSubTask(subTask, async () => {
            this.deleteFile(filesDownloadedInfoFilepath);

            console.log('[PROCESS_PENDING][STEP 2] Videos info temp file deleted');
        });
    }

    private deleteFile(filePath: string): void {
        fs.unlink(filePath, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    private async triggerSubStepGetIdsNotDownloaded(token: string, allIdsToProcess: string[]) {
        console.log('[PROCESS_PENDING][STEP 2] Listing videos not downloaded');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_GET_IDS_NOT_DOWNLOADED, 1);

        return await this.runSubTask(subTask, async () => {
            const notDownloadedIds = await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(token, allIdsToProcess);

            if (notDownloadedIds.length === 0) {
                console.log('[PROCESS_PENDING][STEP 2] Success : All videos downloaded');
            } else {
                await this.createWarningsForNotDownloadedIds(notDownloadedIds);

                console.log('[PROCESS_PENDING][STEP 2] Videos ids not downloaded : ', notDownloadedIds.join(' '));
            }

            return notDownloadedIds;
        });
    }

    private async createWarningsForNotDownloadedIds(notDownloadedIds: string[]): Promise<void> {
        for (const notDownloadedId of notDownloadedIds) {
            await this.createWarning(
                notDownloadedId,
                WarningType.NOT_DOWNLOADED,
                this.NOT_DOWNLOADED_WARNING_MESSAGE,
            );
        }
    }

}