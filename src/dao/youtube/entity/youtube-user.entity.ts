import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('youtube-users')
export class YoutubeUserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'gid' })
    googleId: string;

    @Column()
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    photoUrl: string;

    @Column({ nullable: true })
    pendingPlaylistId: string;

    @Column({ nullable: true })
    processedPlaylistId: string;

    @Column({ nullable: true })
    waitingPlaylistId: string;

    @OneToOne(() => UserEntity, (user) => user.youtubeUser)
    user: UserEntity;
}
