import { Column, CreateDateColumn, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProcessTrackEntity } from './process-track.entity';

export abstract class AbstractProcessStepEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    hasFailed: boolean;

    @Column()
    hasCompleted: boolean;

    @Column()
    errorMessage: string;

    @OneToOne(() => ProcessTrackEntity)
    @JoinColumn()
    rootProcessTrack: ProcessTrackEntity;

    @CreateDateColumn()
    createdAt: Date;
}