import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('dropbox-users')
export class DropboxUserEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    accountId: string;

    @Column()
    displayName: string;

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @OneToOne(() => UserEntity, (user) => user.dropboxUser)
    user: UserEntity;
}