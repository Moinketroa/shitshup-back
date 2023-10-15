import { Injectable, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { TaskCategory } from '../../task/model/task-category.enum';
import { NotionService } from '../../notion/notion.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step6Service extends AbstractStep {

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                private readonly notionService: NotionService) {
        super(processTaskService, taskService);
    }

    async stepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        await this.initStepTask(TaskCategory.STEP6, 1);

        const result = await this.triggerStepProcess(musicDataAnalysisResults);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        return await this.triggerSubStepPushResultsToNotion(musicDataAnalysisResults);
    }

    private async triggerSubStepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 6] Pushing results to Notion...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB6_PUSH_RESULTS_TO_NOTION, musicDataAnalysisResults.length);

        return await this.runSubTask(subTask, async () => {
            for (const musicDataAnalysisResult of musicDataAnalysisResults) {
                await this.notionService.addRowToMediaLibrary(musicDataAnalysisResult);

                await this.progressTask(subTask);
            }
            console.log('[PROCESS_PENDING][STEP 6] Pushing results to Notion done.');
        });
    }

}