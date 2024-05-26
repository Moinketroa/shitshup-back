import { Injectable } from '@nestjs/common';
import { ProcessStepMapper } from './process-step.mapper';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { ProcessTrack } from '../model/process-track.model';
import { DateTime } from 'luxon';
import { AbstractProcessStepEntity } from '../../dao/process/entity/abstract-process-step.entity';
import { ProcessStep } from '../model/process-step.model';

@Injectable()
export class ProcessTrackMapper {

    constructor(private readonly processStepMapper: ProcessStepMapper) {
    }

    fromEntity(processTrack: ProcessTrackEntity): ProcessTrack {
        return <ProcessTrack>{
            id: processTrack.id,
            createdAt: DateTime.fromJSDate(processTrack.createdAt, { zone: 'utc' }).toISO(),
            videoId: processTrack.videoId,
            hasFailed: processTrack.hasFailed,
            hasCompleted: processTrack.hasCompleted,

            step2: this.mapProcessStep(processTrack.processStep2),
            step3: this.mapProcessStep(processTrack.processStep3),
            step4: this.mapProcessStep(processTrack.processStep4),
            step5: this.mapProcessStep(processTrack.processStep5),
            step6: this.mapProcessStep(processTrack.processStep6),
            step7: this.mapProcessStep(processTrack.processStep7),
        }
    }

    private mapProcessStep(processStep: AbstractProcessStepEntity): ProcessStep | null {
        return !!processStep
            ? this.processStepMapper.fromEntity(processStep)
            : null;
    }
}