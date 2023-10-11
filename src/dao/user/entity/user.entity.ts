import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

    @Column({ nullable: true })
    jwtToken: string;

}