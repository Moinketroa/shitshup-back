import { Injectable } from '@nestjs/common';
import {
    YoutubeDownloaderPythonRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-repository.service';
import {
    YoutubeDownloaderPythonFileInfoRepository
} from '../../dao/youtube-downloader-python/youtube-downloader-python-file-info.repository';
import { Step2Results } from './model/step-2-results.model';

@Injectable()
export class Step2Service {

    constructor(private readonly youtubeDownloaderPythonRepository: YoutubeDownloaderPythonRepository,
                private readonly youtubeDownloaderPythonFileInfoRepository: YoutubeDownloaderPythonFileInfoRepository) {
    }

    async stepDownloadPlaylist(token: string, allIdsToProcess: string[]): Promise<Step2Results> {
        console.log('[PROCESS_PENDING][STEP 2] Downloading...');
        const filesDownloadedInfoFilepath = await this.youtubeDownloaderPythonRepository.downloadPlaylist(token, allIdsToProcess);
        console.log('[PROCESS_PENDING][STEP 2] Download finished');

        console.log('[PROCESS_PENDING][STEP 2] Parsing downloaded videos infos');
        const fileInfos = await this.youtubeDownloaderPythonFileInfoRepository.getFileInfos(filesDownloadedInfoFilepath);

        const notDownloaded = await this.youtubeDownloaderPythonRepository.getIdNotDownloaded(token, allIdsToProcess);

        if (notDownloaded.length === 0) {
            console.log('[PROCESS_PENDING][STEP 2] Success : All videos downloaded');
        } else {
            console.log('[PROCESS_PENDING][STEP 2] Videos ids not downloaded : ', notDownloaded.join(' '));
        }

        return <Step2Results>{
            idsNotDownloaded: notDownloaded,
            fileInfos: fileInfos,
        }
    }

}