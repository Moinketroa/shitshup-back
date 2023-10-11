import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { YoutubePersistenceModule } from '../dao/youtube/youtube-persistence-module';
import { ProcessPendingModule } from './process-pending/process-pending.module';
import { AuthModule } from '../auth/auth.module';
import { OAuth2ClientModule } from '../auth/o-auth-2-client.module';
import { YoutubeAuthModule } from '../auth/youtube-auth/youtube-auth.module';

@Module({
    imports: [
        YoutubePersistenceModule,
        ProcessPendingModule,

        AuthModule,
        YoutubeAuthModule,

        OAuth2ClientModule,
    ],
    controllers: [
        YoutubeController,
    ],
    providers: [
        YoutubeService,
    ],
})
export class YoutubeModule {}
