import { Module } from '@nestjs/common';
import { YoutubeDownloaderPythonRepository } from './youtube-downloader-python-repository.service';

@Module({
    providers: [
        YoutubeDownloaderPythonRepository,
    ],
    exports: [
        YoutubeDownloaderPythonRepository,
    ],
})
export class YoutubeDownloaderPythonModule {

}