import { Injectable, Logger, Scope } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository,
} from '../../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import {
    YoutubeDownloaderPythonFileInfoRepository,
} from '../../../dao/youtube-downloader-python/youtube-downloader-python-file-info.repository';
import { Step2Results } from '../model/step-2-results.model';
import * as fs from 'fs';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { WarningService } from '../../../warning/warning.service';
import { WarningType } from '../../../warning/model/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step2Service extends AbstractStep {

    protected readonly logger = new Logger(Step2Service.name);

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
        this.logger.log('Downloading...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_DOWNLOAD_PLAYLIST, allIdsToProcess.length);

        return await this.runSubTask(subTask, async () => {
            const filesDownloadedInfoFilepath = await this.youtubeDownloaderPythonRepository.downloadPlaylist(token, allIdsToProcess);
            this.logger.log('Download finished');

            return filesDownloadedInfoFilepath;
        });
    }

    private async triggerSubStepParseFileInfos(filesDownloadedInfoFilepath: string): Promise<FileInfo[]> {
        this.logger.log('Parsing downloaded videos infos');
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
        this.logger.log('Deleting Videos info temp file');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_DELETE_FILE_INFO_TEMP_FILE, 1);

        return await this.runSubTask(subTask, async () => {
            this.deleteFile(filesDownloadedInfoFilepath);

            this.logger.log('Videos info temp file deleted');
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
        this.logger.log('Listing videos not downloaded');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_GET_IDS_NOT_DOWNLOADED, 1);

        return await this.runSubTask(subTask, async () => {
            const notDownloadedIds = await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(token, allIdsToProcess);

            if (notDownloadedIds.length === 0) {
                this.logger.log('Success : All videos downloaded');
            } else {
                await this.createWarningsForNotDownloadedIds(notDownloadedIds);

                this.logger.log('Videos ids not downloaded : ', notDownloadedIds.join(' '));
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