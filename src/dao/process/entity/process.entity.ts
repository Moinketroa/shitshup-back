import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { ProcessRequest } from '../../../youtube/process/model/process-request.model';
import { ProcessTrackEntity } from './process-track.entity';

@Entity('processes')
export class ProcessEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'jsonb'
    })
    processRequest: ProcessRequest;

    @OneToMany(() => ProcessTrackEntity, processTrack => processTrack.rootProcess)
    processTracks: ProcessTrackEntity[];
}