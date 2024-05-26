import { Injectable, Logger } from '@nestjs/common';
import { AbstractVerticalStepService } from './abstract-vertical-step.service'
import { ProcessStep5Entity } from '../../dao/process/entity/process-step-5.entity';
import { ProcessStep5Repository } from '../../dao/process/process-step-5.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { ProcessStep4Repository } from '../../dao/process/process-step-4.repository';
import { MusicDataAnalysisResult } from '../../youtube/process/model/music-data-analysis-result.model';
import { NotionService } from '../../notion/notion.service';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { AuthService } from '../../auth/auth.service';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep5Service extends AbstractVerticalStepService<ProcessStep5Entity> {

    protected readonly logger = new Logger(VerticalStep5Service.name);

    constructor(private readonly notionService: NotionService,
                private readonly processStep4Repository: ProcessStep4Repository,
                private readonly processStep5Repository: ProcessStep5Repository,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep5Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    protected async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep5Entity): Promise<void> {
        const musicDataAnalysisResult = await this.retrieveMusicDataAnalysisResult(processTrack);

        const notionRowId = await this.pushMusicDataAnalysisResultToNotion(musicDataAnalysisResult);

        await this.updateProcessStepWithNotionRowId(processStep, notionRowId);
    }

    private retrieveMusicDataAnalysisResult(processTrack: ProcessTrackEntity): Promise<MusicDataAnalysisResult> {
        return this.processStep4Repository.getMusicDataAnalysisResultFromProcessTrack(processTrack);
    }

    private async pushMusicDataAnalysisResultToNotion(musicDataAnalysisResult: MusicDataAnalysisResult): Promise<string> {
        this.logger.log('Pushing results to Notion...');

        this.logger.debug(`Sending request...`);

        const rowCreatedId = await this.notionService.addRowToMediaLibrary(musicDataAnalysisResult);

        this.logger.debug(`Request done.`);

        return rowCreatedId;
    }

    private updateProcessStepWithNotionRowId(processStep: ProcessStep5Entity, notionRowId: string): Promise<void> {
        return this.processStep5Repository.updateWithNotionRowId(processStep, notionRowId);
    }
}