import { Module } from '@nestjs/common';
import { YoutubeDownloaderPythonRepository } from './youtube-downloader-python-repository.service';
import { YoutubeDownloaderPythonFileInfoRepository } from './youtube-downloader-python-file-info.repository';

@Module({
    providers: [
        YoutubeDownloaderPythonRepository,
        YoutubeDownloaderPythonFileInfoRepository,
    ],
    exports: [
        YoutubeDownloaderPythonRepository,
        YoutubeDownloaderPythonFileInfoRepository,
    ],
})
export class YoutubeDownloaderPythonModule {

}