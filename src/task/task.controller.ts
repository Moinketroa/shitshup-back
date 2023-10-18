import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './model/task.model';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {

    constructor(private readonly taskService: TaskService) {
    }

    @Get()
    getTasks(): Promise<Task[]> {
        return this.taskService.getTaskTrees();
    }

    @Delete('/:id')
    deleteTask(@Param('id') taskId: string): Promise<void> {
        return this.taskService.deleteTask(taskId);
    }

}