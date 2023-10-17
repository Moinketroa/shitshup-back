import { Injectable, Scope } from '@nestjs/common';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { EssentiaService } from '../../essentia/essentia.service';
import { catchError, finalize, firstValueFrom, map, Observable, tap, throwError } from 'rxjs';
import { MusicDataMapper } from './mapper/music-data.mapper';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';
import { Task } from '../../task/model/task.model';
import { WarningService } from '../../warning/warning.service';
import { WarningType } from '../../warning/mapper/warning-type.enum';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step4Service extends AbstractStep {

    private readonly ESSENTIA_ERROR_WARNING_MESSAGE: string = 'Error during Essentia analysis.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly essentiaService: EssentiaService,
                private readonly musicDataMapper: MusicDataMapper,
                private readonly authService: AuthService,) {
        super(processTaskService, taskService, warningService);
    }

    async stepGetMusicInfos(fileInfos: FileInfo[]): Promise<MusicDataAnalysisResult[]> {
        await this.initStepTask(TaskCategory.STEP4, 1);

        const result = await this.triggerStepProcess(fileInfos);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(fileInfos: FileInfo[]): Promise<MusicDataAnalysisResult[]> {
        return await this.triggerSubStepAnalyseMusicData(fileInfos);
    }

    private async triggerSubStepAnalyseMusicData(fileInfos: FileInfo[]) {
        const currentUser = await this.authService.getCurrentUser();

        console.log('[PROCESS_PENDING][STEP 4] Query Python Server for music data...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB4_ANALYSE_SIMPLE_MUSIC_DATAS, fileInfos.length);

        return await this.runSubTask(subTask, async () => {
            const $musicDataAnalysisResults = fileInfos.map(
                fileInfo => this.buildObservable(fileInfo, currentUser?.id!, subTask)
            );

            return Promise.all($musicDataAnalysisResults.map(obs => firstValueFrom(obs)));
        });
    }

    private buildObservable(fileInfo: FileInfo, userId: string, parentTask: Task): Observable<MusicDataAnalysisResult> {
        return this.essentiaService.getMusicData(fileInfo.filePath, userId)
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
                map(musicData => (
                    this.musicDataMapper.toMusicDataAnalysisResult(musicData, fileInfo)
                )),
                finalize(() => {
                    this.progressTask(parentTask).then();
                })
            )
    }
}