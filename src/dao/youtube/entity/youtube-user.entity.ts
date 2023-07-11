import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
