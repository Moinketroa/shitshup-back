import { Task } from '../../task/model/task.model';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { isDefined } from '../../util/util';
import { TaskCategory } from '../../task/model/task-category.enum';
import { TaskName } from '../../task/model/task-name.model';

export class AbstractStep {

    private stepTask: Task;
    private stepTaskCategory: TaskCategory;

    constructor(private readonly processTaskService: ProcessTaskService,
                private readonly taskService: TaskService,) {

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

    async progressStepTask(): Promise<Task> {
        return (this.stepTask = await this.taskService.incrementTasksDone(this.stepTask));
    }

    async completeStepTask(): Promise<Task> {
        return (this.stepTask = await this.taskService.completeTask(this.stepTask));
    }

    async progressTask(task: Task): Promise<Task> {
        return await this.taskService.incrementTasksDone(task);
    }

    async failTask(task: Task): Promise<Task> {
        return await this.taskService.failTask(task);
    }

    async completeTask(task: Task): Promise<Task> {
        return await this.taskService.completeTask(task);
    }

    async runSubTask<T>(task: Task, taskRun: () => Promise<T>): Promise<T> {
        try {
            return await taskRun();
        } catch (e) {
            console.error(`Task ${task.name} failed.`, e);
            await this.failTask(task);

            throw e;
        } finally {
            await this.completeTask(task);
        }
    }
}