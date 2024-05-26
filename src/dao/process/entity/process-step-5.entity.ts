import { AbstractProcessStepEntity } from './abstract-process-step.entity';
import { Column, Entity } from 'typeorm';

@Entity('process-steps-5')
export class ProcessStep5Entity extends AbstractProcessStepEntity {

    @Column()
    notionRowId: string;

}