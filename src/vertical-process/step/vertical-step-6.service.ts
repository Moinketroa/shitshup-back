import { Injectable, Logger } from '@nestjs/common';
import { AbstractVerticalStepService } from './abstract-vertical-step.service';
import { ProcessStep6Entity } from '../../dao/process/entity/process-step-6.entity';
import { ProcessStep6Repository } from '../../dao/process/process-step-6.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { ProcessStep5Repository } from '../../dao/process/process-step-5.repository';
import { ProcessStep4Repository } from '../../dao/process/process-step-4.repository';
import { MusicDataAnalysisResult } from '../../youtube/process/model/music-data-analysis-result.model';
import { DropboxService } from '../../dropbox/dropbox.service';
import { NotionService } from '../../notion/notion.service';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { AuthService } from '../../auth/auth.service';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep6Service extends AbstractVerticalStepService<ProcessStep6Entity> {

    protected readonly logger = new Logger(VerticalStep6Service.name);

    constructor(private readonly notionService: NotionService,
                private readonly dropboxService: DropboxService,
                private readonly processStep4Repository: ProcessStep4Repository,
                private readonly processStep5Repository: ProcessStep5Repository,
                private readonly processStep6Repository: ProcessStep6Repository,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep6Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    protected async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep6Entity): Promise<void> {
        const notionRowId = await this.retrieveNotionRowId(processTrack);
        const musicDataAnalysisResult = await this.retrieveMusicDataAnalysisResult(processTrack);

        const dropboxFilePath = await this.uploadTrackToDropbox(musicDataAnalysisResult);
        const dropboxSharingLink = await this.createDropboxSharingLink(dropboxFilePath);
        await this.linkDropboxFileToNotionRow(notionRowId, dropboxSharingLink);
    }

    private retrieveNotionRowId(processTrack: ProcessTrackEntity): Promise<string> {
        return this.processStep5Repository.getNotionRowIdFromProcessTrack(processTrack);
    }

    private retrieveMusicDataAnalysisResult(processTrack: ProcessTrackEntity): Promise<MusicDataAnalysisResult> {
        return this.processStep4Repository.getMusicDataAnalysisResultFromProcessTrack(processTrack);
    }

    private async uploadTrackToDropbox(musicDataAnalysisResult: MusicDataAnalysisResult): Promise<string> {
        this.logger.log('Uploading track to Dropbox...');

        this.logger.debug(`Sending request...`);

        const filePath = await this.dropboxService.uploadFileToCloud(musicDataAnalysisResult.fileName, musicDataAnalysisResult.filePath);

        this.logger.debug(`Request done.`);

        return filePath!;
    }

    private async createDropboxSharingLink(dropboxFilePath: string): Promise<string> {
        this.logger.log('Creating Dropbox sharing link...');

        this.logger.debug(`Sending request...`);

        const sharingLink = await this.dropboxService.createSharingLink(dropboxFilePath);

        this.logger.debug(`Request done.`);

        return sharingLink;
    }

    private async linkDropboxFileToNotionRow(notionRowId: string, dropboxSharingLink: string): Promise<void> {
        this.logger.log('Linking Dropbox file to the corresponding Notion row...');

        this.logger.debug(`Sending request...`);

        await this.notionService.linkFileToPage(notionRowId, dropboxSharingLink);

        this.logger.debug(`Request done.`);
    }

}