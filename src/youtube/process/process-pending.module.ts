import { Module, Scope } from '@nestjs/common';
import { YoutubeDownloaderPythonModule } from '../../dao/youtube-downloader-python/youtube-downloader-python-module';
import { YoutubePersistenceModule } from '../../dao/youtube/youtube-persistence-module';
import { ProcessPendingService } from './process-pending.service';
import { Step1Service } from './step/step-1.service';
import { Step2Service } from './step/step-2.service';
import { Step3Service } from './step/step-3.service';
import { Step4Service } from './step/step-4.service';
import { Step5Service } from './step/step-5.service';
import { EssentiaModule } from '../../essentia/essentia.module';
import { MusicDataMapper } from './mapper/music-data.mapper';
import { TaskModule } from '../../task/task.module';
import { ProcessTaskService } from './process-task.service';
import { NotionModule } from '../../notion/notion.module';
import { WarningModule } from '../../warning/warning.module';
import { AuthModule } from '../../auth/auth.module';
import { Step2OneVideoService } from './step/step-2-one-video.service';
import { Step7Service } from './step/step-7.service';
import { DropboxModule } from '../../dropbox/dropbox.module';
import { Step6Service } from './step/step-6.service';

@Module({
    imports: [
        YoutubeDownloaderPythonModule,
        YoutubePersistenceModule,
        EssentiaModule,
        TaskModule,
        NotionModule,
        WarningModule,
        DropboxModule,
        AuthModule.forRoot(),
    ],
    providers: [
        ProcessPendingService,

        Step1Service,
        Step2Service,
        Step2OneVideoService,
        Step3Service,
        Step4Service,
        Step5Service,
        Step7Service,
        Step6Service,

        MusicDataMapper,

        {
            provide: ProcessTaskService,
            useClass: ProcessTaskService,
            scope: Scope.REQUEST,
        },
    ],
    exports: [
        ProcessPendingService,
    ]
})
export class ProcessPendingModule {

}