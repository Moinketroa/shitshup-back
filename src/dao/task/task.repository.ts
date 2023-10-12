import { Injectable } from '@nestjs/common';
import { Repository, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entity/task.entity';
import { isDefined } from '../../util/util';

@Injectable()
export class TaskRepository extends TreeRepository<TaskEntity> {

    constructor(
        @InjectRepository(TaskEntity) repository: Repository<TaskEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async linkTasks(parentTaskId: string, childTaskId: string): Promise<void> {
        const parentTask = await this.findUniqueById(parentTaskId);
        const childTask = await this.findUniqueById(childTaskId);

        childTask!.parentTask = parentTask!;
        await this.save(childTask!);
    }

    async findUniqueById(id: string): Promise<TaskEntity | null> {
        return isDefined(id)
            ? await this.findOneBy({ id: id })
            : null;
    }

    async findCompleteUniqueById(id: string): Promise<TaskEntity | null> {
        return isDefined(id)
            ? await this.findOne({
                  where: {
                      id: id,
                  },
                  relations: {
                      parentTask: true,
                  },
              })
            : null;
    }

    async incrementTaskDone(id: string): Promise<TaskEntity> {
        const taskEntity = (await this.findUniqueById(id))!;

        taskEntity.tasksDone++;

        await this.update(id, taskEntity);

        return taskEntity;
    }

    async failTask(id: string): Promise<TaskEntity> {
        const taskEntity = (await this.findCompleteUniqueById(id))!;

        if (isDefined(taskEntity.parentTask)) {
            await this.failTask(taskEntity.parentTask.id);
        }

        await this.update(id, {
            ...taskEntity,
            hasFailed: true,
        });

        return taskEntity;
    }

    async completeTask(id: string): Promise<TaskEntity> {
        const taskEntity = (await this.findUniqueById(id))!;

        await this.update(id, {
            ...taskEntity,
            tasksDone: taskEntity.totalTasks,
        });

        return taskEntity;
    }
}
