import { Injectable } from '@nestjs/common';
import { ProcessStep } from '../model/process-step.model';
import { AbstractProcessStepEntity } from '../../dao/process/entity/abstract-process-step.entity';
import { DateTime } from 'luxon';

@Injectable()
export class ProcessStepMapper {

    fromEntity(processStepEntity: AbstractProcessStepEntity): ProcessStep {
        return <ProcessStep>{
            id: processStepEntity.id,
            createdAt: DateTime.fromJSDate(processStepEntity.createdAt, { zone: 'utc' }).toISO(),
            hasCompleted: processStepEntity.hasCompleted,
            hasFailed: processStepEntity.hasFailed,
            errorMessage: processStepEntity.errorMessage,
        }
    }

}