import { Injectable } from '@nestjs/common';
import { ProcessRepository } from '../dao/process/process.repository';
import { AuthService } from '../auth/auth.service';
import { ProcessEntity } from '../dao/process/entity/process.entity';
import { ProcessRequest } from '../youtube/process/model/process-request.model';
import { Process } from './model/process.model';
import { ProcessMapper } from './mapper/process.mapper';
import {
    VerticalProcessNotificationGateway
} from './vertical-process-notification/vertical-process-notification.gateway';
import { UserEntity } from '../dao/user/entity/user.entity';

@Injectable()
export class ProcessService {

    constructor(private readonly authService: AuthService,
                private readonly processRepository: ProcessRepository,
                private readonly verticalProcessNotificationGateway: VerticalProcessNotificationGateway,
                private readonly processMapper: ProcessMapper) {
    }

    async getAllProcesses(): Promise<Process[]> {
        const currentUser = await this.authService.getCurrentUser();

        const processEntities = await this.processRepository.getAll(currentUser!);

        return processEntities.map(processEntity => this.processMapper.fromEntity(processEntity));
    }

    async createProcess(processRequest: ProcessRequest): Promise<ProcessEntity> {
        const currentUser = await this.authService.getCurrentUser();

        const process = await this.processRepository.save(<ProcessEntity>{
            user: currentUser,
            processRequest: processRequest,
        });

        await this.sendProcessNotification(currentUser!, process);

        return process;
    }

    private async sendProcessNotification(currentUser: UserEntity, processEntity: ProcessEntity): Promise<void> {
        this.verticalProcessNotificationGateway.server
            .to(currentUser.id)
            .emit(
                'vertical-process-notifications',
                this.processMapper.fromEntity(processEntity)
            );
    }

}