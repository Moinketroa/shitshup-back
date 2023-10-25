import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './dao/persistence.module';
import { YoutubeModule } from './youtube/youtube.module';
import { NotionModule } from './notion/notion.module';
import { TaskNotificationModule } from './task/task-notification/task-notification.module';
import { WarningModule } from './warning/warning.module';
import { TaskModule } from './task/task.module';
import { DropboxAuthModule } from './auth/dropbox-auth/dropbox-auth.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),

        AuthModule.forRoot(),
        DropboxAuthModule,

        PersistenceModule.forRoot(),

        YoutubeModule,

        NotionModule,

        TaskModule,

        TaskNotificationModule,

        WarningModule,
    ],
})
export class AppModule {}
