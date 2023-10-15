import { Injectable, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';
import { TaskCategory } from '../../task/model/task-category.enum';
import { NotionService } from '../../notion/notion.service';
import { WarningService } from '../../warning/warning.service';
import { WarningType } from '../../warning/mapper/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step5Service extends AbstractStep {

    private readonly NOTION_ERROR_WARNING_MESSAGE: string = 'Error during Notion row adding.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly notionService: NotionService) {
        super(processTaskService, taskService, warningService);
    }

    async stepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        await this.initStepTask(TaskCategory.STEP5, 1);

        const result = await this.triggerStepProcess(musicDataAnalysisResults);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        return await this.triggerSubStepPushResultsToNotion(musicDataAnalysisResults);
    }

    private async triggerSubStepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 5] Pushing results to Notion...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB5_PUSH_RESULTS_TO_NOTION, musicDataAnalysisResults.length);

        return await this.runSubTask(subTask, async () => {
            for (const musicDataAnalysisResult of musicDataAnalysisResults) {
                await this.addIdToProcessed(musicDataAnalysisResult);
            }

            console.log('[PROCESS_PENDING][STEP 5] Pushing results to Notion done.');
        });
    }

    private async addIdToProcessed(musicDataAnalysisResult: MusicDataAnalysisResult) {
        try {
            await this.notionService.addRowToMediaLibrary(musicDataAnalysisResult);
        } catch (e: any) {
            await this.createWarning(
                musicDataAnalysisResult.videoId,
                WarningType.NOTION_ADD_ROW_ERROR,
                `${this.NOTION_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }

}