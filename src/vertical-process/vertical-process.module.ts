import { Module } from '@nestjs/common';
import { VerticalProcessService } from './vertical-process.service';
import { VerticalStep1Service } from './step/vertical-step-1.service';
import { OAuth2ClientModule } from '../auth/o-auth-2-client.module';
import { YoutubeDownloaderPythonModule } from '../dao/youtube-downloader-python/youtube-downloader-python-module';
import { ProcessPersistenceModule } from '../dao/process/process-persistence.module';
import { ProcessService } from './process.service';
import { AuthModule } from '../auth/auth.module';
import { ProcessTrackService } from './process-track.service';
import { YoutubePersistenceModule } from '../dao/youtube/youtube-persistence-module';
import { VerticalStep2Service } from './step/vertical-step-2.service';
import { VerticalStep3Service } from './step/vertical-step-3.service';
import { YoutubeAuthModule } from '../auth/youtube-auth/youtube-auth.module';
import { VerticalStep4Service } from './step/vertical-step-4.service';
import { EssentiaModule } from '../essentia/essentia.module';
import { MusicDataMapper } from '../youtube/process/mapper/music-data.mapper';
import { VerticalStep5Service } from './step/vertical-step-5.service';
import { NotionModule } from '../notion/notion.module';
import { VerticalStep6Service } from './step/vertical-step-6.service';
import { DropboxModule } from '../dropbox/dropbox.module';
import { VerticalStep7Service } from './step/vertical-step-7.service';
import { VerticalProcessController } from './vertical-process.controller';
import { DropboxAuthModule } from '../auth/dropbox-auth/dropbox-auth.module';
import {
    VerticalProcessNotificationModule
} from './vertical-process-notification/vertical-process-notification.module';
import { ProcessMapperModule } from './mapper/process-mapper.module';

@Module({
    imports: [
        AuthModule,
        YoutubeAuthModule,
        OAuth2ClientModule,
        DropboxAuthModule,

        YoutubeDownloaderPythonModule,
        YoutubePersistenceModule,
        EssentiaModule,
        NotionModule,
        DropboxModule,

        VerticalProcessNotificationModule,

        ProcessMapperModule,
        ProcessPersistenceModule,
    ],
    providers: [
        ProcessService,
        ProcessTrackService,

        VerticalProcessService,

        VerticalStep1Service,
        VerticalStep2Service,
        VerticalStep3Service,
        VerticalStep4Service,
        VerticalStep5Service,
        VerticalStep6Service,
        VerticalStep7Service,

        MusicDataMapper,
    ],
    controllers: [
        VerticalProcessController,
    ]
})
export class VerticalProcessModule {

}