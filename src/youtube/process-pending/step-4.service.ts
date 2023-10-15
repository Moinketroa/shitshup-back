import { Injectable, Scope } from '@nestjs/common';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { EssentiaService } from '../../essentia/essentia.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { MusicDataMapper } from './mapper/music-data.mapper';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step4Service extends AbstractStep {

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                private readonly essentiaService: EssentiaService,
                private readonly musicDataMapper: MusicDataMapper,) {
        super(processTaskService, taskService);
    }

    async stepGetMusicInfos(fileInfos: FileInfo[]): Promise<MusicDataAnalysisResult[]> {
        await this.initStepTask(TaskCategory.STEP4, 1);

        const result = await this.triggerStepProcess(fileInfos);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(fileInfos: FileInfo[]): Promise<MusicDataAnalysisResult[]> {
        return await this.triggerSubStepAnalyseSimpleMusicData(fileInfos);
    }

    private async triggerSubStepAnalyseSimpleMusicData(fileInfos: FileInfo[]) {
        console.log('[PROCESS_PENDING][STEP 4] Query Python Server for music data...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB4_ANALYSE_SIMPLE_MUSIC_DATAS, fileInfos.length);

        return await this.runSubTask(subTask, async () => {
            const $musicDataAnalysisResults = fileInfos.map(fileInfo => this.buildObservable(fileInfo));

            return Promise.all($musicDataAnalysisResults.map(obs => firstValueFrom(obs)));
        });
    }

    private buildObservable(fileInfo: FileInfo): Observable<MusicDataAnalysisResult> {
        return this.essentiaService.getMusicData(fileInfo.filePath)
            .pipe(
                map(musicData => (
                    this.musicDataMapper.toMusicDataAnalysisResult(musicData, fileInfo)
                ))
            )
    }
}