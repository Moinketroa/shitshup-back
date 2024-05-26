import { AbstractProcessStepRepository } from './abstract-process-step.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessStep5Entity } from './entity/process-step-5.entity';
import { ProcessTrackEntity } from './entity/process-track.entity';

@Injectable()
export class ProcessStep5Repository extends AbstractProcessStepRepository<ProcessStep5Entity> {

    constructor(
        @InjectRepository(ProcessStep5Entity) repository: Repository<ProcessStep5Entity>
    ) {
        super(repository);
    }

    async updateWithNotionRowId(processStep: ProcessStep5Entity, notionRowId: string): Promise<void> {
        await this.update(
            processStep.id,
            {
                notionRowId: notionRowId,
            }
        );
    }

    async getNotionRowIdFromProcessTrack(processTrack: ProcessTrackEntity): Promise<string> {
        const processStep5 = await this.findOneBy({
            rootProcessTrack: { id: processTrack.id },
        });

        return processStep5?.notionRowId!;
    }
}