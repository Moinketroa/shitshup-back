import { Task } from '../../../task/model/task.model';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { isDefined } from '../../../util/util';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { TaskName } from '../../../task/model/task-name.model';
import { WarningService } from '../../../warning/warning.service';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { Logger } from '@nestjs/common';

export abstract class AbstractStep {

    protected abstract logger: Logger;

    private stepTask: Task;
    private stepTaskCategory: TaskCategory;

    protected constructor(private readonly processTaskService: ProcessTaskService,
                          private readonly taskService: TaskService,
                          private readonly warningService: WarningService,) {

    }

    protected async initStepTask(taskCategory: TaskCategory, totalTasks: number): Promise<Task> {
        this.stepTaskCategory = taskCategory;

        const stepTask = <Task>{
            name: new TaskName(
                TaskCategory.PROCESSING_MAIN,
                taskCategory,
            ).toString(),
            totalTasks: totalTasks,
            tasksDone: 0,
            hasFailed: false,
        }

        this.stepTask = await this.taskService.createTask(stepTask);

        await this.linkStepTask(this.stepTask);

        return this.stepTask;
    }

    private async linkStepTask(task: Task): Promise<void> {
        return this.processTaskService.linkStepTask(task);
    }

    protected async createSubStepTask(subTaskCategory: TaskCategory, totalTasks: number): Promise<Task> {
        const subStepTask = <Task>{
            name: new TaskName(
                TaskCategory.PROCESSING_MAIN,
                this.stepTaskCategory,
                subTaskCategory
            ).toString(),
            totalTasks: totalTasks,
            tasksDone: 0,
            hasFailed: false,
        };

        const subStepTaskCreated = await this.taskService.createTask(subStepTask);

        await this.linkSubStepTask(subStepTaskCreated);

        return subStepTaskCreated;
    }

    private async linkSubStepTask(childTask: Task): Promise<void> {
        if (isDefined(this.stepTask)) {
            return this.taskService.createChildTask(this.stepTask, childTask);
        } else {
            throw new Error('Root Step task not defined !')
        }
    }

    protected async progressStepTask(): Promise<Task> {
        return (this.stepTask = await this.taskService.incrementTasksDone(this.stepTask));
    }

    protected async completeStepTask(): Promise<Task> {
        return (this.stepTask = await this.taskService.completeTask(this.stepTask));
    }

    protected async progressTask(task: Task): Promise<Task> {
        return await this.taskService.incrementTasksDone(task);
    }

    protected async failTask(task: Task): Promise<Task> {
        return await this.taskService.failTask(task);
    }

    protected async completeTask(task: Task): Promise<Task> {
        return await this.taskService.completeTask(task);
    }

    protected async createWarning(videoId: string, warningType: WarningType, warningMessage: string) {
        await this.warningService.createWarning(videoId, warningType, warningMessage);
    }

    protected async runSubTask<T>(task: Task, taskRun: () => Promise<T>): Promise<T> {
        try {
            return await taskRun();
        } catch (e) {
            this.logger.error(`Task ${task.name} failed.`, e);
            await this.failTask(task);

            throw e;
        } finally {
            await this.completeTask(task);
            await this.progressStepTask();
        }
    }
}