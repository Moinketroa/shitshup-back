import { Injectable, Logger } from '@nestjs/common';
import { VerticalStep1Service } from './step/vertical-step-1.service';
import { YoutubeUser } from '../auth/youtube-auth/model/youtube-user.model';
import { ProcessService } from './process.service';
import { ProcessRequest } from '../youtube/process/model/process-request.model';
import { VerticalStep2Service } from './step/vertical-step-2.service';
import { VerticalStep3Service } from './step/vertical-step-3.service';
import { VerticalStep4Service } from './step/vertical-step-4.service';
import { VerticalStep5Service } from './step/vertical-step-5.service';
import { VerticalStep6Service } from './step/vertical-step-6.service';
import { VerticalStep7Service } from './step/vertical-step-7.service';
import { ProcessTrackEntity } from '../dao/process/entity/process-track.entity';
import { ProcessTrackService } from './process-track.service';
import { ProcessEntity } from '../dao/process/entity/process.entity';
import { Process } from './model/process.model';

@Injectable()
export class VerticalProcessService {

    protected readonly logger = new Logger(VerticalProcessService.name);

    constructor(private readonly processService: ProcessService,
                private readonly processTrackService: ProcessTrackService,
                private readonly verticalStep1: VerticalStep1Service,
                private readonly verticalStep2: VerticalStep2Service,
                private readonly verticalStep3: VerticalStep3Service,
                private readonly verticalStep4: VerticalStep4Service,
                private readonly verticalStep5: VerticalStep5Service,
                private readonly verticalStep6: VerticalStep6Service,
                private readonly verticalStep7: VerticalStep7Service) {
    }

    getAllProcesses(): Promise<Process[]> {
        return this.processService.getAllProcesses();
    }

    async triggerVerticalProcess(youtubeUser: YoutubeUser, processRequest: ProcessRequest): Promise<ProcessEntity> {
        const processEntity = await this.processService.createProcess(processRequest);

        const processTracks = await this.verticalStep1.triggerStep(youtubeUser, processEntity, processRequest.doDeleteExplicitDuplicates);

        for (const processTrack of processTracks) {
            try {
                await this.triggerStepsForProcessTrack(processTrack, processRequest);
                await this.processTrackService.completeProcessTrack(processTrack);
            } catch (e) {
                await this.processTrackService.failProcessTrack(processTrack);

                this.logger.warn(`Process for track ${ processTrack.videoId } failed. Skipping next steps. Caused by : ${ e.message }`);
            }
        }

        return processEntity;
    }

    private async triggerStepsForProcessTrack(processTrack: ProcessTrackEntity, processRequest: ProcessRequest): Promise<void> {
        await this.verticalStep2.triggerStep(processTrack);

        if (processRequest.doDeleteFromPending) {
            await this.verticalStep3.triggerStep(processTrack);
        }

        if (processRequest.doFetchMusicAnalysisData) {
            await this.verticalStep4.triggerStep(processTrack);

            if (processRequest.doPushResultsToNotion) {
                await this.verticalStep5.triggerStep(processTrack);

                if (processRequest.doLinkNotionToDropbox) {
                    await this.verticalStep6.triggerStep(processTrack);
                }
            }
        }

        if (processRequest.doPredictStems) {
            await this.verticalStep7.triggerStep(processTrack);
        }
    }
}