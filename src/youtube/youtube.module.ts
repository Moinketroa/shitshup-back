import { Module } from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';
import { YoutubeAuthController } from './youtube-auth.controller';
import { YoutubeAuthGuard } from './youtube-auth.guard';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { YoutubePersistenceModule } from '../dao/youtube/youtube-persistence-module';

@Module({
    imports: [
        YoutubePersistenceModule,
    ],
    controllers: [
        YoutubeAuthController,
        YoutubeController,
    ],
    providers: [
        YoutubeAuthService,
        YoutubeAuthGuard,

        YoutubeService,
    ],
})
export class YoutubeModule {}
