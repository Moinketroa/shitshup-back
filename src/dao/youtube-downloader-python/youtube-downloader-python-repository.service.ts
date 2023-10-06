import { Injectable } from '@nestjs/common';
import * as process from 'process';
import { ChildProcessPromise, exec } from 'promisify-child-process';

@Injectable()
export class YoutubeDownloaderPythonRepository {

    private readonly LIST_ID_SCRIPT_PATH: string;
    private readonly CHECK_DIFF_SCRIPT_PATH: string;
    private readonly DOWNLOAD_PLAYLIST_SCRIPT_PATH: string;
    private readonly DOWNLOAD_ARCHIVE_PATH: string;
    private readonly DOWNLOAD_OUTPUT_DIRECTORY_PATH: string;

    constructor() {
        this.LIST_ID_SCRIPT_PATH = process.env.YT_DLP_LIST_ID_SCRIPT_PATH || '';
        this.CHECK_DIFF_SCRIPT_PATH = process.env.YT_DLP_CHECK_DIFF_SCRIPT_PATH || '';
        this.DOWNLOAD_PLAYLIST_SCRIPT_PATH = process.env.YT_DLP_DOWNLOAD_PLAYLIST_SCRIPT_PATH || '';
        this.DOWNLOAD_ARCHIVE_PATH = process.env.YT_DLP_DOWNLOAD_ARCHIVE_PATH || '';
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
            console.warn(`[LIST_ID] Error during List ids of playlist id ${playlistId} : `, stderr);
        }

        const idsOfPlaylist = <string>stdout;

        return idsOfPlaylist?.trim().length === 0
            ? []
            : idsOfPlaylist.split('\n');
    }

    async downloadPlaylist(token: string, allPlaylistIds: string[]): Promise<void> {
        const args = [
            token,
            this.DOWNLOAD_OUTPUT_DIRECTORY_PATH,
            this.DOWNLOAD_ARCHIVE_PATH,
            ...allPlaylistIds,
        ];

        const {
            stderr ,
        } = await this.execScript(this.DOWNLOAD_PLAYLIST_SCRIPT_PATH, ...args);

        if (stderr) {
            console.warn(`[DOWNLOAD_PLAYLIST] Error during download : `, stderr);
        }
    }

    async getIdNotDownloaded(token: string, allPlaylistIds: string[]): Promise<string[]> {
        const args: string[] = [
            token,
            this.DOWNLOAD_ARCHIVE_PATH,
            ...allPlaylistIds,
        ];

        const {
            stdout,
            stderr ,
        } = await this.execScript(this.CHECK_DIFF_SCRIPT_PATH, ...args);

        if (stderr) {
            console.warn(`[CHECK_DIFF] Error during Check diff : `, stderr);
        }

        const idsNotDownloaded = <string>stdout;

        return idsNotDownloaded?.trim().length === 0
            ? []
            : idsNotDownloaded.split('\n');
    }

    private execScript(scriptPath: string, ...args: string[]): ChildProcessPromise {
        const command = `bash ${scriptPath} ${args.join(' ')}`;

        return exec(command);
    }
}
