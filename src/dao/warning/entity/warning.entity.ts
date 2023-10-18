import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('warnings')
export class WarningEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @Column()
    videoId: string;

    @Column()
    warningType: string;

    @Column("text")
    warningMessage: string;

    @CreateDateColumn()
    createdAt: Date;

}