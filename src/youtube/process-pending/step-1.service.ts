import { Injectable, Scope } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository,
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';
import { WarningType } from '../../warning/mapper/warning-type.enum';
import { WarningService } from '../../warning/warning.service';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step1Service extends AbstractStep {

    private readonly NOT_DELETED_WARNING_MESSAGE: string = '[Step 1] Cannot delete explicit duplicate video from pending playlist';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
        super(processTaskService, taskService, warningService);
    }

    async stepVerifyPlaylistIdsAndCheckForExplicitDuplicates(token: string, playlistId: string): Promise<string[]> {
        await this.initStepTask(TaskCategory.STEP1, 3);

        const result = await this.triggerStepProcess(token, playlistId);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(token: string, playlistId: string): Promise<string[]> {
        const allIdsToProcess = await this.triggerSubStepListAllIdsToProcess(token, playlistId);

        if (allIdsToProcess.length === 0) {
            console.log('[PROCESS_PENDING][STEP 1] No videos to process');
            return [];
        }

        const allIdsNotDownloaded = await this.triggerCheckForExplicitDuplicates(token, allIdsToProcess);

        const allExplicitDuplicatesIds = allIdsToProcess.filter(
            (idToProcess) => !allIdsNotDownloaded.includes(idToProcess),
        );

        if (allExplicitDuplicatesIds.length !== 0) {
            await this.triggerDeleteExplicitDuplicates(playlistId, allExplicitDuplicatesIds);
        } else {
            console.log('[PROCESS_PENDING][STEP 1] No Explicit duplicates found.');
        }

        console.log('[PROCESS_PENDING][STEP 1] List of videos to process established.');
        return allIdsNotDownloaded;
    }

    private async triggerSubStepListAllIdsToProcess(token: string, playlistId: string): Promise<string[]> {
        console.log('[PROCESS_PENDING][STEP 1] Fetching IDs of playlist');
        const subTask = await this.createSubStepTask(TaskCategory.SUB1_LIST_ALL_IDS, 1);

        return await this.runSubTask(subTask, async () => {
            return await this.youtubeDownloaderPythonRepository.listAllIdsOfPlaylist(
                token,
                playlistId,
            );
        });
    }

    private async triggerCheckForExplicitDuplicates(token: string, allIdsToProcess: string[]): Promise<string[]> {
        console.log('[PROCESS_PENDING][STEP 1] Fetching IDs of playlist');
        const subTask = await this.createSubStepTask(TaskCategory.SUB1_CHECK_EXPLICIT_DUPLICATES, 1);

        return await this.runSubTask(subTask, async () => {
            return await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(
                token,
                allIdsToProcess,
            );
        });
    }

    private async triggerDeleteExplicitDuplicates(playlistId: string, allExplicitDuplicatesIds: string[]) {
        console.log(
            '[PROCESS_PENDING][STEP 1] Explicit duplicates or unavailable videos found. Excluding from processing and deleting from Pending playlist...',
        );
        const subTask = await this.createSubStepTask(
            TaskCategory.SUB1_DELETE_EXPLICIT_DUPLICATES,
            allExplicitDuplicatesIds.length,
        );

        return await this.runSubTask(subTask, async () => {
            for (const explicitIdToDelete of allExplicitDuplicatesIds) {
                await this.deleteExplicitDuplicate(playlistId, explicitIdToDelete)
            }

            console.log('[PROCESS_PENDING][STEP 1] Explicit duplicates deleted from playlist');
        });
    }

    private async deleteExplicitDuplicate(playlistId: string, explicitIdToDelete: string) {
        try {
            await this.youtubePlaylistRepository.deleteIdFromPlaylist(playlistId, explicitIdToDelete);
        } catch (e: any) {
            await this.createWarning(
                explicitIdToDelete,
                WarningType.CANNOT_DELETE_FROM_PLAYLIST,
                `${this.NOT_DELETED_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }
}
