import { Injectable, Logger } from '@nestjs/common';
import { AbstractVerticalStepService } from './abstract-vertical-step.service';
import { ProcessStep7Entity } from '../../dao/process/entity/process-step-7.entity';
import { ProcessStep7Repository } from '../../dao/process/process-step-7.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { ProcessStep2Repository } from '../../dao/process/process-step-2.repository';
import { AuthService } from '../../auth/auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { EssentiaService } from '../../essentia/essentia.service';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep7Service extends AbstractVerticalStepService<ProcessStep7Entity> {

    protected readonly logger = new Logger(VerticalStep7Service.name);

    constructor(private readonly essentiaService: EssentiaService,
                private readonly processStep2Repository: ProcessStep2Repository,
                private readonly processStep7Repository: ProcessStep7Repository,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep7Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    protected async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep7Entity): Promise<void> {
        const fileInfo = await this.retrieveFileInfo(processTrack);

        await this.getSpleeterData(fileInfo);
    }

    private retrieveFileInfo(processTrack: ProcessTrackEntity): Promise<FileInfo> {
        return this.processStep2Repository.getFileInfoFromProcessTrack(processTrack);
    }

    private async getSpleeterData(fileInfo: FileInfo) {
        const currentUser = await this.authService.getCurrentUser();

        this.logger.log('Query Python Server for spleeter data...');

        this.logger.debug(`Sending request...`);

        await firstValueFrom(this.buildSpleeterDataObservable(fileInfo, currentUser?.id!));

        this.logger.debug(`Request done.`);
    }

    private buildSpleeterDataObservable(fileInfo: FileInfo, userId: string): Observable<void> {
        const musicFilePath: string = fileInfo.filePath;
        const zipFilePath: string = musicFilePath.replace(/\.[^.]+$/, '.zip');

        return this.essentiaService.getSpleeterData(musicFilePath, userId, zipFilePath);
    }
}