import { Column, Entity } from 'typeorm';
import { AbstractProcessStepEntity } from './abstract-process-step.entity';
import { MusicDataAnalysisResult } from '../../../youtube/process/model/music-data-analysis-result.model';

@Entity('process-steps-4')
export class ProcessStep4Entity extends AbstractProcessStepEntity {

    @Column({
        type: 'jsonb'
    })
    musicDataAnalysisResult: MusicDataAnalysisResult;

}