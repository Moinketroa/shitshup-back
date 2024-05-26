import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { ProcessEntity } from './process.entity';
import { ProcessStep2Entity } from './process-step-2.entity';
import { ProcessStep3Entity } from './process-step-3.entity';
import { ProcessStep4Entity } from './process-step-4.entity';
import { ProcessStep5Entity } from './process-step-5.entity';
import { ProcessStep6Entity } from './process-step-6.entity';
import { ProcessStep7Entity } from './process-step-7.entity';

@Entity('process-tracks')
export class ProcessTrackEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    videoId: string;

    @Column()
    hasFailed: boolean;

    @Column()
    hasCompleted: boolean;

    @ManyToOne(() => ProcessEntity)
    @JoinColumn()
    rootProcess: ProcessEntity;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => ProcessStep2Entity, processStep2 => processStep2.rootProcessTrack)
    processStep2: ProcessStep2Entity;

    @OneToOne(() => ProcessStep3Entity, processStep3 => processStep3.rootProcessTrack)
    processStep3: ProcessStep3Entity;

    @OneToOne(() => ProcessStep4Entity, processStep4 => processStep4.rootProcessTrack)
    processStep4: ProcessStep4Entity;

    @OneToOne(() => ProcessStep5Entity, processStep5 => processStep5.rootProcessTrack)
    processStep5: ProcessStep5Entity;

    @OneToOne(() => ProcessStep6Entity, processStep6 => processStep6.rootProcessTrack)
    processStep6: ProcessStep6Entity;

    @OneToOne(() => ProcessStep7Entity, processStep7 => processStep7.rootProcessTrack)
    processStep7: ProcessStep7Entity;
}