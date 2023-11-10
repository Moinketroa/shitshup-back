import { Injectable, Logger, Scope } from '@nestjs/common';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { EssentiaService } from '../../../essentia/essentia.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { MusicDataMapper } from '../mapper/music-data.mapper';
import { MusicDataAnalysisResult } from '../model/music-data-analysis-result.model';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { Task } from '../../../task/model/task.model';
import { WarningService } from '../../../warning/warning.service';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { AuthService } from '../../../auth/auth.service';
import { isDefined } from '../../../util/util';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step4Service extends AbstractStep {

    protected readonly logger = new Logger(Step4Service.name);

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

        this.logger.log('Query Python Server for music data...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB4_ANALYSE_SIMPLE_MUSIC_DATAS, fileInfos.length);

        const results: MusicDataAnalysisResult[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const fileInfo of fileInfos) {
                const musicDataAnalysisResult = await this.analyseMusicData(fileInfo, currentUser?.id!, subTask);

                if (isDefined(musicDataAnalysisResult)) {
                    results.push(musicDataAnalysisResult);
                }
            }

            return results;
        });
    }

    private async analyseMusicData(fileInfo: FileInfo, userId: string, parentTask: Task): Promise<MusicDataAnalysisResult | undefined> {
        try {
            this.logger.debug(`Sending request...`)

            const musicDataAnalysisResult = await firstValueFrom(
                this.buildAnalyseMusicDataObservable(fileInfo, userId)
            );

            this.logger.debug(`Request done.`);

            return musicDataAnalysisResult;
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

    private buildAnalyseMusicDataObservable(fileInfo: FileInfo, userId: string): Observable<MusicDataAnalysisResult> {
        return this.essentiaService.getMusicData(fileInfo.filePath, userId)
            .pipe(
                map(musicData => (
                    this.musicDataMapper.toMusicDataAnalysisResult(musicData, fileInfo)
                )),
            )
    }
}