import { ProcessStep } from './process-step.model';

export class ProcessTrack {
    id: string;
    createdAt: string;
    videoId: string;
    hasCompleted: boolean;
    hasFailed: boolean;

    step2: ProcessStep;
    step3?: ProcessStep;
    step4?: ProcessStep;
    step5?: ProcessStep;
    step6?: ProcessStep;
    step7?: ProcessStep;
}