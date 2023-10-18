import { Injectable } from '@nestjs/common';
import { TaskName } from '../model/task-name.model';
import { TaskEntity } from '../../dao/task/entity/task.entity';
import { Task } from '../model/task.model';
import { UserEntity } from '../../dao/user/entity/user.entity';
import { DateTime } from 'luxon';

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
            parentId: taskEntity.parentTask?.id,
            createDate: DateTime.fromJSDate(taskEntity.createdAt, { zone: 'utc' }).toISO(),
        }
    }

    treeFromEntity(taskEntity: TaskEntity): Task {
        const task = this.fromEntity(taskEntity);

        if (taskEntity?.subTasks?.length !== 0) {
            task.children = taskEntity.subTasks?.map(subTask => this.treeFromEntity(subTask));
        }

        return task;
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