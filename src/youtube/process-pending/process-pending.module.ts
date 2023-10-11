import { Module } from '@nestjs/common';
import { YoutubeDownloaderPythonModule } from '../../dao/youtube-downloader-python/youtube-downloader-python-module';
import { YoutubePersistenceModule } from '../../dao/youtube/youtube-persistence-module';
import { Step1Service } from './step-1.service';
import { ProcessPendingService } from './process-pending.service';
import { Step2Service } from './step-2.service';
import { Step3Service } from './step-3.service';
import { Step5Service } from './step-5.service';
import { EssentiaModule } from '../../essentia/essentia.module';
import { MusicDataMapper } from './mapper/music-data.mapper';

@Module({
    imports: [
        YoutubeDownloaderPythonModule,
        YoutubePersistenceModule,
        EssentiaModule,
    ],
    providers: [
        ProcessPendingService,

        Step1Service,
        Step2Service,
        Step3Service,
        Step5Service,

        MusicDataMapper,
    ],
    exports: [
        ProcessPendingService,
    ]
})
export class ProcessPendingModule {

}