import { TaskCategory } from './task-category.enum';

export class TaskName {

    private taskCategories: TaskCategory[];

    constructor(...taskCategories: TaskCategory[]) {
        this.taskCategories = taskCategories;
    }

    toString(): string {
        return this.taskCategories.map((taskCategory) => `[${taskCategory.toString()}]`).join('');
    }
}