import { Injectable } from '@nestjs/common';
import { ProcessTrackRepository } from '../dao/process/process-track.repository';
import { AuthService } from '../auth/auth.service';
import { ProcessEntity } from '../dao/process/entity/process.entity';
import { ProcessTrackEntity } from '../dao/process/entity/process-track.entity';
import {
    VerticalProcessNotificationGateway
} from './vertical-process-notification/vertical-process-notification.gateway';
import { ProcessMapper } from './mapper/process.mapper';
import { ProcessRepository } from '../dao/process/process.repository';
import { UserEntity } from '../dao/user/entity/user.entity';

@Injectable()
export class ProcessTrackService {

    constructor(private readonly authService: AuthService,
                private readonly verticalProcessNotificationGateway: VerticalProcessNotificationGateway,
                private readonly processMapper: ProcessMapper,
                private readonly processRepository: ProcessRepository,
                private readonly processTrackRepository: ProcessTrackRepository) {
    }

    async createProcessTrack(videoId: string, processEntity: ProcessEntity): Promise<ProcessTrackEntity> {
        const currentUser = await this.authService.getCurrentUser();

        const processTrack = await this.processTrackRepository.save(<ProcessTrackEntity>{
            videoId: videoId,
            rootProcess: processEntity,
            hasFailed: false,
            user: currentUser,
        });

        await this.sendProcessTrackNotification(currentUser!, processEntity, processTrack);

        return processTrack;
    }

    async sendProcessTrackNotification(currentUser: UserEntity, processEntity: ProcessEntity, processTrackEntity: ProcessTrackEntity): Promise<void> {
        const processEntityForNotification = { ...processEntity } as ProcessEntity;
        processEntityForNotification.processTracks = [ processTrackEntity ];

        this.verticalProcessNotificationGateway.server
            .to(currentUser.id)
            .emit(
                'vertical-process-notifications',
                this.processMapper.fromEntity(processEntityForNotification)
            );
    }

    async getExplicitExternalDuplicates(videoIds: string[]): Promise<string[]> {
        const currentUser = await this.authService.getCurrentUser();

        return this.processTrackRepository.getExplicitDuplicates(videoIds, currentUser!);
    }

    async completeProcessTrack(processTrack: ProcessTrackEntity): Promise<void> {
        await this.processTrackRepository.update(processTrack.id, {
            hasCompleted: true,
        });
    }

    async failProcessTrack(processTrack: ProcessTrackEntity): Promise<void> {
        await this.processTrackRepository.update(processTrack.id, {
            hasFailed: true,
        });
    }

}