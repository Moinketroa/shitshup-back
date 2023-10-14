import { Injectable } from '@nestjs/common';
import { TaskNotificationGateway } from './task-notification.gateway';
import { TaskRepository } from '../../dao/task/task.repository';
import { TaskMapper } from '../mapper/task.mapper';
import { isNullOrUndefined } from '../../util/util';
import { TaskCategory } from '../model/task-category.enum';
import { TaskName } from '../model/task-name.model';

@Injectable()
export class TaskNotificationSender {

    private readonly ROOT_TASK_NAME = new TaskName(TaskCategory.PROCESSING_MAIN).toString();

    constructor(private readonly taskNotificationGateway: TaskNotificationGateway,
                private readonly taskMapper: TaskMapper,
                private readonly taskRepository: TaskRepository,) {
    }

    async sendTaskNotification(taskId: string) {
        const taskCreatedOrModified = await this.taskRepository.findCompleteUniqueById(taskId);

        if (isNullOrUndefined(taskCreatedOrModified?.parentTask) && taskCreatedOrModified?.taskName !== this.ROOT_TASK_NAME) {
            // The task is created but is not a root task. Waiting for it to be attached to its parent task
            return;
        } else {
            this.taskNotificationGateway.server
                .to(taskCreatedOrModified?.user.id!)
                .emit(
                    'tasks-notifications',
                    this.taskMapper.fromEntity(taskCreatedOrModified!)
                );
        }
    }

}