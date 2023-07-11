import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './dao/persistence.module';
import { YoutubeModule } from './youtube/youtube.module';
import { NotionModule } from './notion/notion.module';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        PersistenceModule,

        YoutubeModule,

        NotionModule,
    ],
})
export class AppModule {}
