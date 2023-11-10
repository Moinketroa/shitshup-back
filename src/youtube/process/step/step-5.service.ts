import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { MusicDataAnalysisResult } from '../model/music-data-analysis-result.model';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { NotionService } from '../../../notion/notion.service';
import { WarningService } from '../../../warning/warning.service';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { Step5Result } from '../model/step-5-result.model';
import { isDefined } from '../../../util/util';
import { Task } from '../../../task/model/task.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step5Service extends AbstractStep {

    protected readonly logger = new Logger(Step5Service.name);

    private readonly NOTION_ERROR_WARNING_MESSAGE: string = 'Error during Notion row adding.';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly notionService: NotionService) {
        super(processTaskService, taskService, warningService);
    }

    async stepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<Step5Result[]> {
        await this.initStepTask(TaskCategory.STEP5, 1);

        const result = await this.triggerStepProcess(musicDataAnalysisResults);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<Step5Result[]> {
        return await this.triggerSubStepPushResultsToNotion(musicDataAnalysisResults);
    }

    private async triggerSubStepPushResultsToNotion(musicDataAnalysisResults: MusicDataAnalysisResult[]): Promise<Step5Result[]> {
        this.logger.log('Pushing results to Notion...');
        const subTask = await this.createSubStepTask(TaskCategory.SUB5_PUSH_RESULTS_TO_NOTION, musicDataAnalysisResults.length);

        const results: Step5Result[] = [];

        return await this.runSubTask(subTask, async () => {
            for (const musicDataAnalysisResult of musicDataAnalysisResults) {
                const notionRowId = await this.addAnalysisResultToNotion(musicDataAnalysisResult, subTask);

                if (isDefined(notionRowId)) {
                    results.push(<Step5Result>{
                        notionRowId: notionRowId,
                        musicDataAnalysisResult: musicDataAnalysisResult,
                    });
                }
            }

            this.logger.log('Pushing results to Notion done.');
            return results;
        });
    }

    private async addAnalysisResultToNotion(musicDataAnalysisResult: MusicDataAnalysisResult, subTask: Task): Promise<string | undefined> {
        try {
            this.logger.debug(`Sending request...`);

            const rowCreatedId = await this.notionService.addRowToMediaLibrary(musicDataAnalysisResult);

            this.logger.debug(`Request done.`);

            return rowCreatedId;
        } catch (e: any) {
            this.logger.error(e);

            await this.createWarning(
                musicDataAnalysisResult.videoId,
                WarningType.NOTION_ADD_ROW_ERROR,
                `${this.NOTION_ERROR_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }

}