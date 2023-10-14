export class Task {
    id?: string;
    name: string;
    totalTasks: number;
    tasksDone: number;
    hasFailed: boolean;
    children?: Task[];
    parentId?: string;
}
