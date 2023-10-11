import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { YoutubeUserEntity } from '../../youtube/entity/youtube-user.entity';

@Entity('users')
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    googleAccessToken: string;

    @Column()
    googleRefreshToken: string;

    @OneToOne(() => YoutubeUserEntity, (youtubeUser) => youtubeUser.user)
    @JoinColumn()
    youtubeUser: YoutubeUserEntity;

}