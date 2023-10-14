import { Module } from '@nestjs/common';
import { TaskNotificationGateway } from './task-notification.gateway';
import { TaskNotificationService } from './task-notification.service';
import { TaskNotificationListener } from './task-notification.listener';
import { ModuleConfigService } from '../../module-config.service';
import { Client } from 'pg';
import { TaskPersistenceModule } from '../../dao/task/task-persistence.module';
import { TaskNotificationSender } from './task-notification.sender';
import { TaskMapper } from '../mapper/task.mapper';
import { AuthModule } from '../../auth/auth.module';
import { AuthGuard } from '../../auth/guard/auth.guard';

export function pgClientInit(moduleConfigServiceConfig: ModuleConfigService) {
    const env = moduleConfigServiceConfig.config;

    return new Client({
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_DATABASE,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
    });
}

@Module({
    imports: [
        TaskPersistenceModule,
        AuthModule,
    ],
    providers: [
        TaskNotificationGateway,
        TaskNotificationService,
        TaskNotificationListener,
        TaskNotificationSender,

        TaskMapper,

        AuthGuard,

        ModuleConfigService,

        {
            provide: Client,
            useFactory: pgClientInit,
            inject: [ ModuleConfigService ],
        }
    ],
    exports: [
        TaskNotificationListener,
    ]
})
export class TaskNotificationModule {

}