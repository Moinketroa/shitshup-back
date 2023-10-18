import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';
import { WarningService } from '../../warning/warning.service';
import { WarningType } from '../../warning/model/warning-type.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step3Service extends AbstractStep {

    private readonly NOT_DELETED_WARNING_MESSAGE: string = '[Step 3] Cannot delete video from pending playlist';
    private readonly NOT_ADDED_WARNING_MESSAGE: string = '[Step 3] Cannot add video to processed playlist';

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
        super(processTaskService, taskService, warningService);
    }

    async stepMoveVideosFromPendingToProcessed(
        youtubeUser: YoutubeUser,
        allIdsToProcess: string[],
        notDownloadedIds: string[],
    ): Promise<void> {
        await this.initStepTask(TaskCategory.STEP3, 2);

        const result = await this.triggerStepProcess(youtubeUser, allIdsToProcess, notDownloadedIds);

        await this.completeStepTask();

        return result;
    }

    private async triggerStepProcess(
        youtubeUser: YoutubeUser,
        allIdsToProcess: string[],
        notDownloadedIds: string[],
    ): Promise<void> {
        const allDownloadedIds = allIdsToProcess.filter(
            (idToProcess) => !notDownloadedIds.includes(idToProcess),
        );

        if (allDownloadedIds.length === 0) {
            return ;
        }

        await this.triggerSubStepDeleteIdsFromPending(youtubeUser, allDownloadedIds);

        await this.triggerSubStepAddIdsToProcessed(youtubeUser, allDownloadedIds);

        console.log('[PROCESS_PENDING][STEP 3] Moving done.');
    }

    private async triggerSubStepDeleteIdsFromPending(youtubeUser: YoutubeUser, allDownloadedIds: string[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 3] Moving videos from pending playlist to processed playlist.');
        const subTask = await this.createSubStepTask(TaskCategory.SUB3_DELETE_IDS_FROM_PENDING, allDownloadedIds.length);

        return await this.runSubTask(subTask, async () => {
            console.log('[PROCESS_PENDING][STEP 3] Deleting videos from pending playlist.');

            for (const downloadedId of allDownloadedIds) {
                await this.deleteIdFromPending(youtubeUser, downloadedId);
            }

            console.log('[PROCESS_PENDING][STEP 3] Deleting done.');
        });
    }

    private async deleteIdFromPending(youtubeUser: YoutubeUser, downloadedId: string) {
        try {
            await this.youtubePlaylistRepository.deleteIdFromPlaylist(youtubeUser.pendingPlaylistId, downloadedId);
        } catch (e: any) {
            await this.createWarning(
                downloadedId,
                WarningType.CANNOT_DELETE_FROM_PLAYLIST,
                `${this.NOT_DELETED_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }

    private async triggerSubStepAddIdsToProcessed(youtubeUser: YoutubeUser, allDownloadedIds: string[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 3] Proceeding to adding videos to processed playlist.');
        const subTask = await this.createSubStepTask(TaskCategory.SUB3_ADD_IDS_TO_PROCESSED, allDownloadedIds.length);

        return await this.runSubTask(subTask, async () => {
            for (const downloadedId of allDownloadedIds) {
                await this.addIdToProcessed(youtubeUser, downloadedId);
            }

            console.log('[PROCESS_PENDING][STEP 3] Videos added to processed playlist.');
        });
    }

    private async addIdToProcessed(youtubeUser: YoutubeUser, downloadedId: string) {
        try {
            await this.youtubePlaylistRepository.addIdToPlaylist(youtubeUser.processedPlaylistId, downloadedId);
        } catch (e: any) {
            await this.createWarning(
                downloadedId,
                WarningType.CANNOT_ADD_TO_PLAYLIST,
                `${this.NOT_ADDED_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressStepTask();
        }
    }

}