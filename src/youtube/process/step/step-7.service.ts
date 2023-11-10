import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { WarningService } from '../../../warning/warning.service';
import { EssentiaService } from '../../../essentia/essentia.service';
import { AuthService } from '../../../auth/auth.service';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { firstValueFrom, Observable } from 'rxjs';
import { Task } from '../../../task/model/task.model';
import { WarningType } from '../../../warning/model/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step7Service extends AbstractStep {

    protected readonly logger = new Logger(Step7Service.name);

    private readonly ESSENTIA_ERROR_WARNING_MESSAGE: string = 'Error during Spleeter prediction.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly essentiaService: EssentiaService,
                private readonly authService: AuthService,) {
        super(processTaskService, taskService, warningService);
    }

    async stepGetSpleeterData(fileInfos: FileInfo[]): Promise<any> {
        await this.initStepTask(TaskCategory.STEP7, 1);

        const result = await this.triggerStepProcess(fileInfos);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(fileInfos: FileInfo[]): Promise<void> {
        await this.triggerSubStepGetSpleeterData(fileInfos);
    }

    private async triggerSubStepGetSpleeterData(fileInfos: FileInfo[]) {
        const currentUser = await this.authService.getCurrentUser();

        this.logger.log('Query Python Server for spleeter data...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB7_GET_SPLEETER_DATA, fileInfos.length);

        return await this.runSubTask(subTask, async () => {
            for (const fileInfo of fileInfos) {
                await this.getSpleeterData(fileInfo, currentUser?.id!, subTask);
            }
        });
    }

    private async getSpleeterData(fileInfo: FileInfo, userId: string, parentTask: Task) {
        try {
            this.logger.debug(`Sending request...`);

            await firstValueFrom(this.buildSpleeterDataObservable(fileInfo, userId));

            this.logger.debug(`Request done.`);
        } catch (e) {
            this.logger.error(e);

            await this.createWarning(
                fileInfo.id,
                WarningType.ESSENTIA_ERROR,
                `${this.ESSENTIA_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(parentTask);
        }
    }

    private buildSpleeterDataObservable(fileInfo: FileInfo, userId: string): Observable<void> {
        const musicFilePath: string = fileInfo.filePath;
        const zipFilePath: string = musicFilePath.replace(/\.[^.]+$/, '.zip');

        return this.essentiaService.getSpleeterData(musicFilePath, userId, zipFilePath);
    }
}