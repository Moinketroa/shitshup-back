import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './dao/persistence.module';
import { YoutubeAuthModule } from './youtube/youtube-auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PersistenceModule,
        YoutubeAuthModule,
    ],
})
export class AppModule {}
