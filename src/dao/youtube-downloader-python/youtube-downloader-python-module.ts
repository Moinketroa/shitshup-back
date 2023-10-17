import { Module } from '@nestjs/common';
import { YoutubeDownloaderPythonRepository } from './youtube-downloader-python-repository.service';
import { YoutubeDownloaderPythonFileInfoRepository } from './youtube-downloader-python-file-info.repository';
import { WarningModule } from '../../warning/warning.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [
        WarningModule,
        AuthModule,
    ],
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