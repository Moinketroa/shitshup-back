import { Injectable, Logger } from '@nestjs/common';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { ProcessStep3Repository } from '../../dao/process/process-step-3.repository';
import { ProcessStep3Entity } from '../../dao/process/entity/process-step-3.entity';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';
import { YoutubeAuthService } from '../../auth/youtube-auth/youtube-auth.service';
import { AbstractVerticalStepService } from './abstract-vertical-step.service';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { AuthService } from '../../auth/auth.service';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

@Injectable()
export class VerticalStep3Service extends AbstractVerticalStepService<ProcessStep3Entity>{

    protected readonly logger = new Logger(VerticalStep3Service.name);

    constructor(private readonly processStep3Repository: ProcessStep3Repository,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository,
                private readonly youtubeAuthService: YoutubeAuthService,
                authService: AuthService,
                processTrackRepository: ProcessTrackRepository,
                processMapper: ProcessMapper,
                verticalProcessNotificationGateway: VerticalProcessNotificationGateway,) {
        super(processStep3Repository,
            authService,
            processTrackRepository,
            processMapper,
            verticalProcessNotificationGateway);
    }

    async runStep(processTrack: ProcessTrackEntity, processStep: ProcessStep3Entity): Promise<void> {
        await this.deleteIdFromPending(processTrack.videoId);
    }

    private async deleteIdFromPending(videoId: string): Promise<void> {
        const youtubeUser = await this.youtubeAuthService.getCurrentUser();

        this.logger.log('Deleting videos from pending playlist.');

        await this.youtubePlaylistRepository.deleteIdFromPlaylist(youtubeUser!.pendingPlaylistId, videoId);

        this.logger.log('Deleting done.');
    }
}