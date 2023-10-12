import { Injectable } from '@nestjs/common';
import { TaskName } from '../model/task-name.model';
import { TaskEntity } from '../../dao/task/entity/task.entity';
import { Task } from '../model/task.model';
import { UserEntity } from '../../dao/user/entity/user.entity';

@Injectable()
export class TaskMapper {

    createRootEntity(name: TaskName, totalTasks: number, user: UserEntity): TaskEntity {
        return <TaskEntity>{
            taskName: name.toString(),
            totalTasks: totalTasks,
            tasksDone: 0,
            hasFailed: false,
            user: user,
        }
    }

    fromEntity(taskEntity: TaskEntity): Task {
        return <Task>{
            id: taskEntity.id,
            name: taskEntity.taskName,
            totalTasks: taskEntity.totalTasks,
            tasksDone: taskEntity.tasksDone,
            hasFailed: taskEntity.hasFailed,
        }
    }

    toEntity(task: Task, user: UserEntity): TaskEntity {
        return <TaskEntity>{
            id: task.id,
            taskName: task.name,
            totalTasks: task.totalTasks,
            tasksDone: task.tasksDone,
            hasFailed: task.hasFailed,
            user: user,
        }
    }

}