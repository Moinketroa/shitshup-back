import { Module } from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';
import { OAuth2ClientModule } from '../o-auth-2-client.module';
import { YoutubePersistenceModule } from '../../dao/youtube/youtube-persistence-module';

@Module({
    imports: [
        OAuth2ClientModule,
        YoutubePersistenceModule,
    ],
    providers: [
        YoutubeAuthService,
    ],
    exports: [
        YoutubeAuthService,
    ]
})
export class YoutubeAuthModule {}