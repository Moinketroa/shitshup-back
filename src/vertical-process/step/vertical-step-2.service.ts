import { Injectable, Logger } from '@nestjs/common';
import { ProcessStep2Repository } from '../../dao/process/process-step-2.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { OAuth2Client } from 'google-auth-library';
import {
    YoutubeDownloaderPythonRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import {
    YoutubeDownloaderPythonFileInfoRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-file-info.repository';
import * as fs from 'fs';
import { ProcessStep2Entity } from '../../dao/process/entity/process-step-2.entity';
import { AbstractVerticalStepService } from './abstract-vertical-step.service';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { AuthService } from '../../auth/auth.service';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep2Service extends AbstractVerticalStepService<ProcessStep2Entity> {

    protected readonly logger = new Logger(VerticalStep2Service.name);

    constructor(private readonly oAuth2Client: OAuth2Client,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubeDownloaderPythonFileInfoRepository: YoutubeDownloaderPythonFileInfoRepository,
                private readonly processStep2Repository: ProcessStep2Repository,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep2Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep2Entity): Promise<void> {
        const fileInfoPath = await this.downloadVideo(processTrack.videoId);

        const fileInfo = await this.parseFileInfo(fileInfoPath);

        await this.updateProcessStepWithFileInfo(processStep, fileInfo);

        await this.deleteFileInfoTempFile(fileInfoPath);
    }

    private async downloadVideo(videoId: string): Promise<string> {
        const tokenRes = await this.oAuth2Client.getAccessToken();
        const token = tokenRes.token as string;

        this.logger.log(`Downloading video ${videoId}...`);

        const fileInfoPath = await this.youtubeDownloaderPythonRepository.downloadOneVideo(token, videoId);
        this.logger.log(`Video ${videoId} : Download finished`);

        return fileInfoPath;
    }

    private parseFileInfo(fileInfoPath: string): Promise<FileInfo> {
        this.logger.log('Parsing downloaded video infos');

        return this.youtubeDownloaderPythonFileInfoRepository.getFileInfo(fileInfoPath);
    }

    private updateProcessStepWithFileInfo(processStep: ProcessStep2Entity, fileInfo: FileInfo): Promise<void> {
        this.logger.log('Saving file infos');

        return this.processStep2Repository.updateWithFileInfo(processStep, fileInfo);
    }

    private async deleteFileInfoTempFile(fileInfoPath: string): Promise<void> {
        this.logger.log('Deleting Videos info temp file');

        this.deleteFile(fileInfoPath);

        this.logger.log('Videos info temp file deleted');
    }

    private deleteFile(filePath: string): void {
        fs.unlinkSync(filePath);
    }
}