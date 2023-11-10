import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { ChildProcessPromise, exec } from 'promisify-child-process';
import { WarningService } from '../../warning/warning.service';
import { isString } from '@nestjs/common/utils/shared.utils';
import { WarningType } from '../../warning/model/warning-type.enum';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class YoutubeDownloaderPythonRepository {

    private readonly logger = new Logger(YoutubeDownloaderPythonRepository.name);

    private readonly LIST_ID_SCRIPT_PATH: string;
    private readonly CHECK_DIFF_SCRIPT_PATH: string;
    private readonly DOWNLOAD_PLAYLIST_SCRIPT_PATH: string;
    private readonly DOWNLOAD_ONE_VIDEO_SCRIPT_PATH: string;
    private readonly DOWNLOAD_ARCHIVE_DIRECTORY_PATH: string;
    private readonly DOWNLOAD_ARCHIVE_NAME: string;
    private readonly DOWNLOAD_OUTPUT_DIRECTORY_PATH: string;

    constructor(private readonly warningService: WarningService,
                private readonly authService: AuthService,) {
        this.LIST_ID_SCRIPT_PATH = process.env.YT_DLP_LIST_ID_SCRIPT_PATH || '';
        this.CHECK_DIFF_SCRIPT_PATH = process.env.YT_DLP_CHECK_DIFF_SCRIPT_PATH || '';
        this.DOWNLOAD_PLAYLIST_SCRIPT_PATH = process.env.YT_DLP_DOWNLOAD_PLAYLIST_SCRIPT_PATH || '';
        this.DOWNLOAD_ONE_VIDEO_SCRIPT_PATH = process.env.YT_DLP_DOWNLOAD_ONE_VIDEO_SCRIPT_PATH || '';
        this.DOWNLOAD_ARCHIVE_DIRECTORY_PATH = process.env.YT_DLP_DOWNLOAD_ARCHIVE_DIRECTORY_PATH || '';
        this.DOWNLOAD_ARCHIVE_NAME = process.env.YT_DLP_DOWNLOAD_ARCHIVE_NAME || '';
        this.DOWNLOAD_OUTPUT_DIRECTORY_PATH = process.env.YT_DLP_DOWNLOAD_OUTPUT_DIRECTORY_PATH || '';
    }

    async listAllIdsOfPlaylist(token: string, playlistId: string): Promise<string[]> {
        const args = [
            token,
            playlistId
        ];

        const {
            stdout,
            stderr ,
        } = await this.execScript(this.LIST_ID_SCRIPT_PATH, ...args);

        if (stderr) {
            this.logger.warn(`[LIST_ID] Error during List ids of playlist id ${playlistId} : `, stderr);

            await this.handleError(stderr);
        }

        const idsOfPlaylistStringOutput = (<string>stdout)?.trim();

        const idsOfPlaylist = idsOfPlaylistStringOutput?.length === 0
            ? []
            : idsOfPlaylistStringOutput.split('\n');

        this.logger.debug(`[LIST_ID] ${ idsOfPlaylist.length } IDs in playlist ID ${ playlistId }`);

        return idsOfPlaylist;
    }

    async downloadPlaylist(token: string, allPlaylistIds: string[]): Promise<string> {
        const currentUser = await this.authService.getCurrentUser();

        const args = [
            token,
            `${this.DOWNLOAD_OUTPUT_DIRECTORY_PATH}/${currentUser?.id}`,
            `${this.DOWNLOAD_ARCHIVE_DIRECTORY_PATH}/${currentUser?.id}/${this.DOWNLOAD_ARCHIVE_NAME}`,
            ...allPlaylistIds,
        ];

        const {
            stdout,
            stderr ,
        } = await this.execScript(this.DOWNLOAD_PLAYLIST_SCRIPT_PATH, ...args);

        if (stderr) {
            this.logger.warn(`[DOWNLOAD_PLAYLIST] Error during download : `, stderr);
        }

        const filesDownloadedInfoFilepath = (<string>stdout)?.trim();

        this.logger.debug(`File ${ filesDownloadedInfoFilepath } created`);

        return filesDownloadedInfoFilepath;
    }

    async downloadOneVideo(token: string, videoId: string): Promise<string> {
        const currentUser = await this.authService.getCurrentUser();

        const args = [
            token,
            `${this.DOWNLOAD_OUTPUT_DIRECTORY_PATH}/${currentUser?.id}`,
            videoId,
        ];

        const {
            stdout,
            stderr ,
        } = await this.execScript(this.DOWNLOAD_ONE_VIDEO_SCRIPT_PATH, ...args);

        if (stderr) {
            this.logger.warn(`[DOWNLOAD_PLAYLIST] Error during download : `, stderr);

            if (isString(stderr)) {
                await this.warningService.createWarning(videoId, WarningType.NOT_DOWNLOADED, stderr);
            }
        }

        const filesDownloadedInfoFilepath = (<string>stdout)?.trim();

        this.logger.debug(`File ${ filesDownloadedInfoFilepath } created`);

        return filesDownloadedInfoFilepath;
    }

    async getIdNotDownloaded(token: string, allPlaylistIds: string[]): Promise<string[]> {
        const currentUser = await this.authService.getCurrentUser();

        const args: string[] = [
            token,
            `${this.DOWNLOAD_ARCHIVE_DIRECTORY_PATH}/${currentUser?.id}/${this.DOWNLOAD_ARCHIVE_NAME}`,
            ...allPlaylistIds,
        ];

        const {
            stdout,
            stderr ,
        } = await this.execScript(this.CHECK_DIFF_SCRIPT_PATH, ...args);

        if (stderr) {
            this.logger.warn(`[CHECK_DIFF] Error during Check diff : `, stderr);

            await this.handleError(stderr);
        }

        const idsNotDownloadedStringOutput = (<string>stdout)?.trim();

        const idsNotDownloaded = idsNotDownloadedStringOutput?.length === 0
            ? []
            : idsNotDownloadedStringOutput.split('\n');

        this.logger.debug(`${ idsNotDownloaded.length } IDs not downloaded in ${ allPlaylistIds.length } original IDs`);

        return idsNotDownloaded;
    }

    private execScript(scriptPath: string, ...args: string[]): ChildProcessPromise {
        const command = `bash ${scriptPath} ${args.join(' ')}`;

        return exec(command);
    }

    private async handleError(stdErr: string | Buffer) {
        if (isString(stdErr)) {
            if (stdErr.includes('Video unavailable')) {
                const searchString = '[youtube] ';

                const videoIdIndex = stdErr.indexOf(searchString) + searchString.length;
                const videoId = stdErr.slice(videoIdIndex, videoIdIndex + 11);

                await this.warningService.createWarning(videoId, WarningType.VIDEO_UNAVAILABLE, stdErr);
            }
        }
    }
}
