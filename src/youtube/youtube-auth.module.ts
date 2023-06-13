import { Module } from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';
import { YoutubeAuthController } from './youtube-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from '../dao/entity/youtube-user.entity';
import { YoutubeUserMapper } from '../dao/mapper/youtube-user.mapper';
import { YoutubeAuthGuard } from './youtube-auth.guard';

@Module({
    controllers: [
        YoutubeAuthController,
    ],
    providers: [
        YoutubeAuthService,
        YoutubeUserMapper,
        YoutubeAuthGuard,
    ],
    imports: [
        TypeOrmModule.forFeature([YoutubeUserEntity]),
    ]
})
export class YoutubeAuthModule {}
