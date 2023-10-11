import { Module, Scope } from '@nestjs/common';
import { YoutubePlaylistMapper } from './mapper/youtube-playlist.mapper';
import { YoutubeUserMapper } from './mapper/youtube-user.mapper';
import { YoutubePlaylistRepository } from './youtube-playlist-repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './entity/youtube-user.entity';
import { OAuth2Client } from 'google-auth-library';
import { GoogleApis } from 'googleapis';
import { YoutubeClient } from './type/youtube-client.type';
import { YoutubePlaylistPreviewMapper } from './mapper/youtube-playlist-preview.mapper';
import { YoutubePlaylistItemMapper } from './mapper/youtube-playlist-item.mapper';
import { OAuth2ClientModule } from '../../auth/o-auth-2-client.module';

export function youtubeClientInit(oAuth2Client: OAuth2Client) {
    const googleClient = new GoogleApis({
        auth: oAuth2Client,
    });

    return googleClient.youtube('v3');
}

@Module({
    imports: [
        TypeOrmModule.forFeature([YoutubeUserEntity]),
        OAuth2ClientModule,
    ],
    providers: [
        YoutubePlaylistMapper,
        YoutubePlaylistPreviewMapper,
        YoutubePlaylistItemMapper,
        YoutubeUserMapper,

        YoutubePlaylistRepository,

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

        TypeOrmModule.forFeature([YoutubeUserEntity]),
    ],
})
export class YoutubePersistenceModule {

}