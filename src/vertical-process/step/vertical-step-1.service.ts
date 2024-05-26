import { Injectable, Logger } from '@nestjs/common';
import { YoutubeUser } from '../../auth/youtube-auth/model/youtube-user.model';
import { OAuth2Client } from 'google-auth-library';
import {
    YoutubeDownloaderPythonRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import { ProcessEntity } from '../../dao/process/entity/process.entity';
import * as _ from 'lodash';
import { ProcessTrackService } from '../process-track.service';
import { ProcessTrackEntity } from '../../dao/process/entity/process-track.entity';
import { YoutubePlaylistRepository } from '../../dao/youtube/youtube-playlist-repository.service';
@Injectable()
export class VerticalStep1Service {

    protected readonly logger = new Logger(VerticalStep1Service.name);

    constructor(private readonly oAuth2Client: OAuth2Client,
                private readonly processTrackService: ProcessTrackService,
                private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubePlaylistRepository: YoutubePlaylistRepository) {
    }

    async triggerStep(youtubeUser: YoutubeUser, processEntity: ProcessEntity, doDeleteExplicitDuplicates: boolean): Promise<ProcessTrackEntity[]> {
        const videosIds = await this.fetchPlaylistIds(youtubeUser);
        const videosIdsWithoutExplicitInternalDuplicates = this.removeExplicitInternalDuplicates(videosIds);
        const videosIdsExplicitExternalDuplicates = await this.getExplicitExternalDuplicates(videosIdsWithoutExplicitInternalDuplicates);

        if (doDeleteExplicitDuplicates) {
            this.deleteExplicitExternalDuplicates(youtubeUser, videosIdsExplicitExternalDuplicates).then();
        }

        const videosIdsWithoutExplicitDuplicates = this.removeExplicitExternalDuplicates(videosIdsWithoutExplicitInternalDuplicates, videosIdsExplicitExternalDuplicates);

        return this.createProcessTracks(videosIdsWithoutExplicitDuplicates, processEntity);
    }

    private async fetchPlaylistIds(youtubeUser: YoutubeUser): Promise<string[]> {
        const tokenRes = await this.oAuth2Client.getAccessToken();
        const token = tokenRes.token as string;

        const pendingPlaylistId = youtubeUser.pendingPlaylistId;

        this.logger.log('Fetching IDs of playlist');

        return this.youtubeDownloaderPythonRepository.listAllIdsOfPlaylist(
            token,
            pendingPlaylistId,
        );
    }

    private removeExplicitInternalDuplicates(videoIds: string[]): string[] {
        return _.uniq(videoIds);
    }

    private async getExplicitExternalDuplicates(videoIds: string[]): Promise<string[]> {
        return this.processTrackService.getExplicitExternalDuplicates(videoIds);
    }

    private async deleteExplicitExternalDuplicates(youtubeUser: YoutubeUser, videoIdsDuplicates: string[]): Promise<void> {
        const playlistId = youtubeUser.pendingPlaylistId;

        for (const duplicateToDelete of videoIdsDuplicates) {
            await this.youtubePlaylistRepository.deleteIdFromPlaylist(playlistId, duplicateToDelete);
        }
    }

    private removeExplicitExternalDuplicates(videoIds: string[], videoIdsExternalDuplicates: string[]): string[] {
        return videoIds.filter(videoId => !videoIdsExternalDuplicates.includes(videoId));
    }

    private async createProcessTracks(videoIds: string[], processEntity: ProcessEntity): Promise<ProcessTrackEntity[]> {
        const processTracks = [];

        for (const videoId of videoIds) {
            processTracks.push(await this.processTrackService.createProcessTrack(videoId, processEntity));
        }

        return processTracks;
    }
}