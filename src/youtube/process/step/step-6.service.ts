import { Injectable, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { WarningService } from '../../../warning/warning.service';
import { EssentiaService } from '../../../essentia/essentia.service';
import { AuthService } from '../../../auth/auth.service';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { catchError, finalize, firstValueFrom, Observable, tap, throwError } from 'rxjs';
import { Task } from '../../../task/model/task.model';
import { WarningType } from '../../../warning/model/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step6Service extends AbstractStep {

    private readonly ESSENTIA_ERROR_WARNING_MESSAGE: string = 'Error during Spleeter prediction.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly essentiaService: EssentiaService,
                private readonly authService: AuthService,) {
        super(processTaskService, taskService, warningService);
    }

    async stepGetSpleeterData(fileInfos: FileInfo[]): Promise<any> {
        await this.initStepTask(TaskCategory.STEP6, 1);

        const result = await this.triggerStepProcess(fileInfos);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(fileInfos: FileInfo[]): Promise<void> {
        await this.triggerSubStepGetSpleeterData(fileInfos);
    }

    private async triggerSubStepGetSpleeterData(fileInfos: FileInfo[]) {
        const currentUser = await this.authService.getCurrentUser();

        console.log('[PROCESS_PENDING][STEP 6] Query Python Server for spleeter data...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB6_GET_SPLEETER_DATA, fileInfos.length);

        return await this.runSubTask(subTask, async () => {
            for (const fileInfo of fileInfos) {
                await this.getSpleeterData(fileInfo, currentUser?.id!, subTask);
            }
        });
    }

    private async getSpleeterData(fileInfo: FileInfo, userId: string, parentTask: Task) {
        return await firstValueFrom(
            this.buildSpleeterDataObservable(fileInfo, userId, parentTask)
        );
    }

    private buildSpleeterDataObservable(fileInfo: FileInfo, userId: string, parentTask: Task): Observable<void> {
        const musicFilePath: string = fileInfo.filePath;
        const zipFilePath: string = musicFilePath.replace(/\.[^.]+$/, '.zip');

        return this.essentiaService.getSpleeterData(musicFilePath, userId, zipFilePath)
            .pipe(
                catchError((err, caught) => {
                    this.createWarning(
                        fileInfo.id,
                        WarningType.ESSENTIA_ERROR,
                        `${this.ESSENTIA_ERROR_WARNING_MESSAGE} ${err.toString()}`,
                    ).then();

                    return throwError(err);
                }),
                tap(() => {
                    this.progressTask(parentTask).then();
                }),
                finalize(() => {
                    this.progressTask(parentTask).then();
                })
            )
    }
}