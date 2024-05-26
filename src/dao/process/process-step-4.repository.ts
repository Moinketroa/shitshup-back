import { AbstractProcessStepRepository } from './abstract-process-step.repository';
import { ProcessStep4Entity } from './entity/process-step-4.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicDataAnalysisResult } from '../../youtube/process/model/music-data-analysis-result.model';
import { ProcessTrackEntity } from './entity/process-track.entity';

@Injectable()
export class ProcessStep4Repository extends AbstractProcessStepRepository<ProcessStep4Entity> {

    constructor(
        @InjectRepository(ProcessStep4Entity) repository: Repository<ProcessStep4Entity>
    ) {
        super(repository);
    }

    async updateWithMusicDataAnalysisResult(processStep: ProcessStep4Entity, musicDataAnalysisResult: MusicDataAnalysisResult): Promise<void> {
        await this.update(
            processStep.id,
            {
                musicDataAnalysisResult: musicDataAnalysisResult,
            }
        );
    }

    async getMusicDataAnalysisResultFromProcessTrack(processTrack: ProcessTrackEntity): Promise<MusicDataAnalysisResult> {
        const processStep4 = await this.findOneBy({
            rootProcessTrack: { id: processTrack.id },
        });

        return processStep4?.musicDataAnalysisResult!;
    }
}