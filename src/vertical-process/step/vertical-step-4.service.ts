import { Injectable, Logger } from '@nestjs/common';
import { AbstractVerticalStepService } from './abstract-vertical-step.service';
import { ProcessStep4Entity } from '../../dao/process/entity/process-step-4.entity';
import { ProcessStep4Repository } from '../../dao/process/process-step-4.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { MusicDataAnalysisResult } from '../../youtube/process/model/music-data-analysis-result.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { EssentiaService } from '../../essentia/essentia.service';
import { MusicDataMapper } from '../../youtube/process/mapper/music-data.mapper';
import { AuthService } from '../../auth/auth.service';
import { ProcessStep2Repository } from '../../dao/process/process-step-2.repository';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep4Service extends AbstractVerticalStepService<ProcessStep4Entity> {

    protected readonly logger = new Logger(VerticalStep4Service.name);

    constructor(private readonly processStep2Repository: ProcessStep2Repository,
                private readonly processStep4Repository: ProcessStep4Repository,
                private readonly essentiaService: EssentiaService,
                private readonly musicDataMapper: MusicDataMapper,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep4Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    protected async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep4Entity): Promise<void> {
        const fileInfo = await this.retrieveFileInfo(processTrack);

        const musicDataAnalysisResult = await this.analyseMusicData(fileInfo);

        await this.updateProcessStepWithMusicDataAnalysisResult(processStep, musicDataAnalysisResult);
    }

    private retrieveFileInfo(processTrack: ProcessTrackEntity): Promise<FileInfo> {
        return this.processStep2Repository.getFileInfoFromProcessTrack(processTrack);
    }

    private async analyseMusicData(fileInfo: FileInfo): Promise<MusicDataAnalysisResult> {
        const currentUser = await this.authService.getCurrentUser();
        this.logger.log('Query Python Server for music data...');

        this.logger.debug(`Sending request...`)

        const musicDataAnalysisResult = await firstValueFrom(
            this.buildAnalyseMusicDataObservable(fileInfo, currentUser!.id)
        );

        this.logger.debug(`Request done.`);

        return musicDataAnalysisResult;
    }

    private buildAnalyseMusicDataObservable(fileInfo: FileInfo, userId: string): Observable<MusicDataAnalysisResult> {
        return this.essentiaService.getMusicData(fileInfo.filePath, userId)
            .pipe(
                map(musicData => (
                    this.musicDataMapper.toMusicDataAnalysisResult(musicData, fileInfo)
                )),
            )
    }

    private updateProcessStepWithMusicDataAnalysisResult(processStep: ProcessStep4Entity, musicDataAnalysisResult: MusicDataAnalysisResult): Promise<void> {
        return this.processStep4Repository.updateWithMusicDataAnalysisResult(processStep, musicDataAnalysisResult);
    }
}