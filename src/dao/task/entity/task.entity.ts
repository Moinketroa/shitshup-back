import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('tasks')
@Tree('materialized-path')
export class TaskEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskName: string;

    @Column()
    totalTasks: number;

    @Column()
    tasksDone: number;

    @Column()
    hasFailed: boolean;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @TreeParent()
    parentTask?: TaskEntity;

    @TreeChildren()
    subTasks?: TaskEntity[];

}