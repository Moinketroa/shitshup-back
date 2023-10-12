import { Injectable, Scope } from '@nestjs/common';
import { TaskService } from '../../task/task.service';
import { Task } from '../../task/model/task.model';
import { isDefined } from '../../util/util';
import { TaskName } from '../../task/model/task-name.model';
import { TaskCategory } from '../../task/model/task-category.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class ProcessTaskService {

    processMainTask: Task;

    constructor(private readonly taskService: TaskService) {

    }

    async initProcessMainTask(totalSteps: number): Promise<Task> {
        this.processMainTask = await this.taskService.createRootTask(
            new TaskName(TaskCategory.PROCESSING_MAIN),
            totalSteps,
        );

        return this.processMainTask;
    }

    async linkStepTask(childTask: Task): Promise<void> {
        if (isDefined(this.processMainTask)) {
            return this.taskService.createChildTask(this.processMainTask, childTask);
        } else {
            throw new Error('Root process task not defined !')
        }
    }

    async incrementTasksDone(): Promise<Task> {
        return await this.taskService.incrementTasksDone(this.processMainTask);
    }

}