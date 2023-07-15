import { Module, Scope } from '@nestjs/common';
import { YoutubePlaylistMapper } from './mapper/youtube-playlist.mapper';
import { YoutubeUserMapper } from './mapper/youtube-user.mapper';
import { YoutubePlaylistRepository } from './youtube-playlist-repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './entity/youtube-user.entity';
import { ModuleConfigService } from '../../module-config.service';
import { OAuth2Client } from 'google-auth-library';
import { GoogleApis } from 'googleapis';
import { YoutubeClient } from './type/youtube-client.type';
import { YoutubePlaylistPreviewMapper } from './mapper/youtube-playlist-preview.mapper';
import { YoutubePlaylistItemMapper } from './mapper/youtube-playlist-item.mapper';

export function oAuth2ClientInit(moduleConfigServiceConfig: ModuleConfigService) {
    const env = moduleConfigServiceConfig.config;

    return new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URL,
    );
}

export function youtubeClientInit(oAuth2Client: OAuth2Client) {
    const googleClient = new GoogleApis({
        auth: oAuth2Client,
    });

    return googleClient.youtube('v3');
}

@Module({
    imports: [
        TypeOrmModule.forFeature([YoutubeUserEntity]),
    ],
    providers: [
        YoutubePlaylistMapper,
        YoutubePlaylistPreviewMapper,
        YoutubePlaylistItemMapper,
        YoutubeUserMapper,

        YoutubePlaylistRepository,

        ModuleConfigService,

        {
            provide: OAuth2Client,
            useFactory: oAuth2ClientInit,
            inject: [ ModuleConfigService ],
            scope: Scope.DEFAULT,
        },

        {
            provide: YoutubeClient,
            useFactory: youtubeClientInit,
            inject: [ OAuth2Client ],
            scope: Scope.REQUEST,
        },
    ],
    exports: [
        YoutubeUserMapper,

        YoutubePlaylistRepository,

        OAuth2Client,
        TypeOrmModule.forFeature([YoutubeUserEntity]),
    ],
})
export class YoutubePersistenceModule {

}