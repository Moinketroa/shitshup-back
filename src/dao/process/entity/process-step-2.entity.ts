import { Column, Entity } from 'typeorm';
import { AbstractProcessStepEntity } from './abstract-process-step.entity';

@Entity('process-steps-2')
export class ProcessStep2Entity extends AbstractProcessStepEntity {

    @Column()
    fileInfoId: string;

    @Column()
    fileInfoTrack: string;

    @Column()
    fileInfoArtist: string;

    @Column()
    fileInfoFilePath: string;

}