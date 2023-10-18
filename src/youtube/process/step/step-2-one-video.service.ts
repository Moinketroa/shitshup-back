import { Injectable, Scope } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository,
} from '../../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import {
    YoutubeDownloaderPythonFileInfoRepository,
} from '../../../dao/youtube-downloader-python/youtube-downloader-python-file-info.repository';
import * as fs from 'fs';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { WarningService } from '../../../warning/warning.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step2OneVideoService extends AbstractStep {

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubeDownloaderPythonFileInfoRepository: YoutubeDownloaderPythonFileInfoRepository,) {
        super(processTaskService, taskService, warningService);
    }

    async stepDownloadOneVideo(token: string, videoId: string): Promise<FileInfo[]> {
        await this.initStepTask(TaskCategory.STEP2, 3);

        const result = await this.triggerStepProcess(token, videoId);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(token: string, videoId: string): Promise<FileInfo[]> {
        const filesDownloadedInfoFilepath = await this.triggerSubStepDownloadOneVideo(token, videoId);

        const fileInfos = await this.triggerSubStepParseFileInfos(filesDownloadedInfoFilepath);

        await this.triggerSubStepDeleteFileInfoTempFile(filesDownloadedInfoFilepath);

        return fileInfos;
    }

    private async triggerSubStepDownloadOneVideo(token: string, videoId: string): Promise<string> {
        console.log('[PROCESS_PENDING][STEP 2] Downloading...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB2_DOWNLOAD_PLAYLIST, 1);

        return await this.runSubTask(subTask, async () => {
            const filesDownloadedInfoFilepath = await this.youtubeDownloaderPythonRepository.downloadOneVideo(token, videoId);
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

}