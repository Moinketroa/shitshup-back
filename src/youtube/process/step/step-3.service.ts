import { Injectable, Scope } from '@nestjs/common';
import { YoutubeUser } from '../../../auth/youtube-auth/model/youtube-user.model';
import { YoutubePlaylistRepository } from '../../../dao/youtube/youtube-playlist-repository.service';
import { AbstractStep } from './abstract-step.class';
import { ProcessTaskService } from '../process-task.service';
import { TaskService } from '../../../task/task.service';
import { TaskCategory } from '../../../task/model/task-category.enum';
import { WarningService } from '../../../warning/warning.service';
import { WarningType } from '../../../warning/model/warning-type.enum';
import { Task } from '../../../task/model/task.model';

@Injectable({
    scope: Scope.TRANSIENT,
})
export class Step3Service extends AbstractStep {

    private readonly NOT_DELETED_WARNING_MESSAGE: string = '[Step 3] Cannot delete video from pending playlist';
    constructor(processTaskService: ProcessTaskService,
                taskService: TaskService,
                warningService: WarningService,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
        super(processTaskService, taskService, warningService);
    }

    async stepDeleteVideosFromPending(
        youtubeUser: YoutubeUser,
        allIdsToProcess: string[],
        notDownloadedIds: string[],
    ): Promise<void> {
        await this.initStepTask(TaskCategory.STEP3, 1);

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
    }

    private async triggerSubStepDeleteIdsFromPending(youtubeUser: YoutubeUser, allDownloadedIds: string[]): Promise<void> {
        const subTask = await this.createSubStepTask(TaskCategory.SUB3_DELETE_IDS_FROM_PENDING, allDownloadedIds.length);

        return await this.runSubTask(subTask, async () => {
            console.log('[PROCESS_PENDING][STEP 3] Deleting videos from pending playlist.');

            for (const downloadedId of allDownloadedIds) {
                await this.deleteIdFromPending(youtubeUser, downloadedId, subTask);
            }

            console.log('[PROCESS_PENDING][STEP 3] Deleting done.');
        });
    }

    private async deleteIdFromPending(youtubeUser: YoutubeUser, downloadedId: string, subTask: Task) {
        try {
            await this.youtubePlaylistRepository.deleteIdFromPlaylist(youtubeUser.pendingPlaylistId, downloadedId);
        } catch (e: any) {
            await this.createWarning(
                downloadedId,
                WarningType.CANNOT_DELETE_FROM_PLAYLIST,
                `${this.NOT_DELETED_WARNING_MESSAGE} ${e.toString()}`,
            )
        } finally {
            await this.progressTask(subTask);
        }
    }

}