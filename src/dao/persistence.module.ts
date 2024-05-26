import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './youtube/entity/youtube-user.entity';
import { NotionConfigEntity } from './notion/entity/notion-config.entity';
import { UserEntity } from './user/entity/user.entity';
import { TaskEntity } from './task/entity/task.entity';
import { WarningEntity } from './warning/entity/warning.entity';
import { DropboxUserEntity } from './dropbox/entity/dropbox-user.entity';
import * as process from 'process';
import { ProcessEntity } from './process/entity/process.entity';
import { ProcessTrackEntity } from './process/entity/process-track.entity';
import { ProcessStep2Entity } from './process/entity/process-step-2.entity';
import { ProcessStep3Entity } from './process/entity/process-step-3.entity';
import { ProcessStep4Entity } from './process/entity/process-step-4.entity';
import { ProcessStep5Entity } from './process/entity/process-step-5.entity';
import { ProcessStep6Entity } from './process/entity/process-step-6.entity';
import { ProcessStep7Entity } from './process/entity/process-step-7.entity';

const moduleEntities: any[] = [
    YoutubeUserEntity,
    NotionConfigEntity,
    UserEntity,
    TaskEntity,
    WarningEntity,
    DropboxUserEntity,
    ProcessEntity,
    ProcessTrackEntity,
    ProcessStep2Entity,
    ProcessStep3Entity,
    ProcessStep4Entity,
    ProcessStep5Entity,
    ProcessStep6Entity,
    ProcessStep7Entity,
];

@Module({})
export class PersistenceModule {

    static forRoot(): DynamicModule {
        return {
            module: PersistenceModule,
            imports: [PersistenceModule.registerTypeOrmModule()],
        };
    }

    static registerTypeOrmModule(): DynamicModule {
        const dbType = process.env.DB_TYPE || '';
        const dbHost = process.env.DB_HOST || '';
        const dbPort = Number(process.env.DB_PORT) || 0;
        const dbUsername = process.env.DB_USERNAME || '';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbDatabase = process.env.DB_DATABASE || '';
        const dbSchema = process.env.DB_SCHEMA || '';
        const dbSynchronize = (process.env.DB_SYNCHRONIZE === 'true') || false;

        return {
            module: PersistenceModule,
            imports: [
                TypeOrmModule.forRoot({
                    type: dbType as any,
                    host: dbHost,
                    port: dbPort,
                    username: dbUsername,
                    password: dbPassword,
                    database: dbDatabase,
                    schema: dbSchema,
                    entities: moduleEntities,
                    synchronize: dbSynchronize,
                }),
            ],
            exports: [
                TypeOrmModule,
            ]
        };
    }
}
