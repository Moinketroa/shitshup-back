import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../dao/task/task.repository';
import { TaskName } from './model/task-name.model';
import { Task } from './model/task.model';
import { TaskMapper } from './mapper/task.mapper';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TaskService {

    constructor(private readonly taskMapper: TaskMapper,
                private readonly authService: AuthService,
                private readonly taskRepository: TaskRepository) {
    }

    async createRootTask(taskName: TaskName, totalTasks: number): Promise<Task> {
        const currentUser = await this.authService.getCurrentUser();

        const newTaskEntity = this.taskMapper.createRootEntity(taskName, totalTasks, currentUser!);

        const taskEntityCreated = await this.taskRepository.save(newTaskEntity);

        return this.taskMapper.fromEntity(taskEntityCreated);
    }

    async createTask(task: Task): Promise<Task> {
        const currentUser = await this.authService.getCurrentUser();

        const newTaskEntity = this.taskMapper.toEntity(task, currentUser!);

        const taskEntityCreated = await this.taskRepository.save(newTaskEntity);

        return this.taskMapper.fromEntity(taskEntityCreated);
    }

    async createChildTask(parentTask: Task, childTask: Task): Promise<void> {
        await this.taskRepository.linkTasks(parentTask.id!, childTask.id!);
    }

    async incrementTasksDone(task: Task): Promise<Task> {
        return this.taskMapper.fromEntity(
            await this.taskRepository.incrementTaskDone(task.id!)
        );
    }

    async failTask(task: Task): Promise<Task> {
        return this.taskMapper.fromEntity(
            await this.taskRepository.failTask(task.id!)
        );
    }

    async completeTask(task: Task): Promise<Task> {
        return this.taskMapper.fromEntity(
            await this.taskRepository.completeTask(task.id!)
        );
    }
}