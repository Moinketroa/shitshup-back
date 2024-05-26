export class ProcessStep {
    id: string;
    createdAt: string;
    hasCompleted: boolean;
    hasFailed: boolean;
    errorMessage?: string;
}