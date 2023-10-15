import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from './process-task.service';
import { TaskService } from '../../task/task.service';
import { TaskCategory } from '../../task/model/task-category.enum';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step3Service extends AbstractStep {

    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
        super(processTaskService, taskService);
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
    }

    private async triggerSubStepDeleteIdsFromPending(youtubeUser: YoutubeUser, allDownloadedIds: string[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 3] Moving videos from pending playlist to processed playlist.');
        const subTask = await this.createSubStepTask(TaskCategory.SUB3_DELETE_IDS_FROM_PENDING, allDownloadedIds.length);

        return await this.runSubTask(subTask, async () => {
            console.log('[PROCESS_PENDING][STEP 3] Deleting videos from pending playlist.');

            for (const downloadedId of allDownloadedIds) {
                await this.youtubePlaylistRepository.deleteIdFromPlaylist(youtubeUser.pendingPlaylistId, downloadedId);

                await this.progressStepTask();
            }

            console.log('[PROCESS_PENDING][STEP 3] Deleting done.');
        });
    }

    private async triggerSubStepAddIdsToProcessed(youtubeUser: YoutubeUser, allDownloadedIds: string[]): Promise<void> {
        console.log('[PROCESS_PENDING][STEP 3] Proceeding to adding videos to processed playlist.');
        const subTask = await this.createSubStepTask(TaskCategory.SUB3_ADD_IDS_TO_PROCESSED, allDownloadedIds.length);

        return await this.runSubTask(subTask, async () => {
            for (const downloadedId of allDownloadedIds) {
                await this.youtubePlaylistRepository.addIdToPlaylist(youtubeUser.processedPlaylistId, downloadedId);

                await this.progressTask(subTask);
            }

            console.log('[PROCESS_PENDING][STEP 3] Videos added to processed playlist.');
            console.log('[PROCESS_PENDING][STEP 3] Moving done.');
        });
    }

}