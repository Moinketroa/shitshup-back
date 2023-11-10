import { Injectable, Logger, Scope } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository,
} from '../../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { YoutubePlaylistRepository } from '../../../dao/youtube/youtube-playlist-repository.service';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { WarningService } from '../../../warning/warning.service';
import { Task } from '../../../task/model/task.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step1Service extends AbstractStep {

    protected readonly logger = new Logger(Step1Service.name);

    private readonly NOT_DELETED_WARNING_MESSAGE: string = '[Step 1] Cannot delete explicit duplicate video from pending playlist';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
        super(processTaskService, taskService, warningService);
    }

    async stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(token: string, playlistId: string, doDeleteExplicitDuplicates: boolean): Promise<string[]> {
        await this.initStepTask(TaskCategory.STEP1, this.calculateTotalSteps(doDeleteExplicitDuplicates));

        const result = await this.triggerStepProcess(token, playlistId, doDeleteExplicitDuplicates);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(token: string, playlistId: string, doDeleteExplicitDuplicates: boolean): Promise<string[]> {
        const allIdsToProcess = await this.triggerSubStepListAllIdsToProcess(token, playlistId);

        if (allIdsToProcess.length === 0) {
            this.logger.log('No videos to process');
            return [];
        }

        const allIdsNotDownloaded = await this.triggerCheckForExplicitDuplicates(token, allIdsToProcess);

        const allExplicitDuplicatesIds = allIdsToProcess.filter(
            (idToProcess) => !allIdsNotDownloaded.includes(idToProcess),
        );

        if (allExplicitDuplicatesIds.length !== 0) {
            if (doDeleteExplicitDuplicates) {
                await this.triggerDeleteExplicitDuplicates(playlistId, allExplicitDuplicatesIds);
            } else {
                this.logger.log('Explicit duplicates found. Excluding them from process');
            }
        } else {
            this.logger.log('No Explicit duplicates found.');
        }

        this.logger.log('List of videos to process established.');
        return allIdsNotDownloaded;
    }

    private async triggerSubStepListAllIdsToProcess(token: string, playlistId: string): Promise<string[]> {
        this.logger.log('Fetching IDs of playlist');
        const subTask = await this.createSubStepTask(TaskCategory.SUB1_LIST_ALL_IDS, 1);

        return await this.runSubTask(subTask, async () => {
            return await this.youtubeDownloaderPythonRepository.listAllIdsOfPlaylist(
                token,
                playlistId,
            );
        });
    }

    private async triggerCheckForExplicitDuplicates(token: string, allIdsToProcess: string[]): Promise<string[]> {
        this.logger.log('Checking for explicit duplicates');
        const subTask = await this.createSubStepTask(TaskCategory.SUB1_CHECK_EXPLICIT_DUPLICATES, 1);

        return await this.runSubTask(subTask, async () => {
            return await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(
                token,
                allIdsToProcess,
            );
        });
    }

    private async triggerDeleteExplicitDuplicates(playlistId: string, allExplicitDuplicatesIds: string[]) {
        this.logger.log(
            'Explicit duplicates or unavailable videos found. Excluding from processing and deleting from Pending playlist...',
        );
        const subTask = await this.createSubStepTask(
            TaskCategory.SUB1_DELETE_EXPLICIT_DUPLICATES,
            allExplicitDuplicatesIds.length,
        );

        return await this.runSubTask(subTask, async () => {
            for (const explicitIdToDelete of allExplicitDuplicatesIds) {
                await this.deleteExplicitDuplicate(playlistId, explicitIdToDelete, subTask);
            }

            this.logger.log('Explicit duplicates deleted from playlist');
        });
    }

    private async deleteExplicitDuplicate(playlistId: string, explicitIdToDelete: string, subTask: Task) {
        try {
            await this.youtubePlaylistRepository.deleteIdFromPlaylist(playlistId, explicitIdToDelete);

            this.logger.debug(`Video ID ${ explicitIdToDelete } deleted from playlist ID ${ playlistId }`);
        } catch (e: any) {
            this.logger.error(e);

            await this.createWarning(
                explicitIdToDelete,
                WarningType.CANNOT_DELETE_FROM_PLAYLIST,
                `${this.NOT_DELETED_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }

    private calculateTotalSteps(doDeleteExplicitDuplicates: boolean): number {
        return doDeleteExplicitDuplicates
            ? 3
            : 2;
    }
}
