import { Logger } from '@nestjs/common';
import { AbstractProcessStepEntity } from '../../dao/process/entity/abstract-process-step.entity';
import { AbstractProcessStepRepository } from '../../dao/process/abstract-process-step.repository';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import {
    VerticalProcessNotificationGateway
} from '../vertical-process-notification/vertical-process-notification.gateway';
import { ProcessEntity } from '../../dao/process/entity/process.entity';
import { AuthService } from '../../auth/auth.service';
import { ProcessTrackRepository } from '../../dao/process/process-track.repository';
import { ProcessMapper } from '../mapper/process.mapper';

export abstract class AbstractVerticalStepService<T extends AbstractProcessStepEntity> {

    protected abstract logger: Logger;

    protected constructor(protected readonly processStepRepository: AbstractProcessStepRepository<T>,
                          protected readonly authService: AuthService,
                          protected readonly processTrackRepository: ProcessTrackRepository,
                          protected readonly processMapper: ProcessMapper,
                          protected readonly verticalProcessNotificationGateway: VerticalProcessNotificationGateway) {
    }

    async triggerStep(processTrack: ProcessTrackEntity): Promise<void> {
        const processStep = await this.createProcessStep(processTrack);

        try {
            await this.runStep(processTrack, processStep);

            await this.complete(processTrack, processStep, processTrack.videoId);
        } catch (e) {
            await this.fail(processTrack, processStep, processTrack.videoId, e);

            throw e;
        }
    }

    protected abstract runStep(processTrack: ProcessTrackEntity, processStep: T): Promise<void>;

    private async createProcessStep(processTrack: ProcessTrackEntity): Promise<T> {
        const processStep = this.processStepRepository.createOne(processTrack);

        await this.sendProcessStepNotification(processTrack);

        return processStep;
    }

    private async complete(processTrack: ProcessTrackEntity, processStep: T, videoId: string): Promise<void> {
        this.logger.log(`Process Step for video ${videoId} completed.`);

        await this.processStepRepository.complete(processStep);

        await this.sendProcessStepNotification(processTrack);
    }

    private async fail(processTrack: ProcessTrackEntity, processStep: T, videoId: string, error: Error): Promise<void> {
        this.logger.log(`Process Step for video ${videoId} failed.`);
        this.logger.error(error);

        await this.processStepRepository.fail(processStep, error.message);

        await this.sendProcessStepNotification(processTrack);
    }

    private async sendProcessStepNotification(processTrackEntity: ProcessTrackEntity) {
        const currentUser = await this.authService.getCurrentUser();
        const fullProcessTrackEntity = await this.processTrackRepository.getFullById(processTrackEntity.id);

        const processEntityForNotification = { ...fullProcessTrackEntity!.rootProcess } as ProcessEntity;
        processEntityForNotification.processTracks = [ fullProcessTrackEntity! ];

        this.verticalProcessNotificationGateway.server
            .to(currentUser!.id)
            .emit(
                'vertical-process-notifications',
                this.processMapper.fromEntity(processEntityForNotification)
            );
    }
}