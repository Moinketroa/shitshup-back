import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './youtube/entity/youtube-user.entity';
import { NotionConfigEntity } from './notion/entity/notion-config.entity';
import { UserEntity } from './user/entity/user.entity';
import { TaskEntity } from './task/entity/task.entity';

const moduleEntities: any[] = [
    YoutubeUserEntity,
    NotionConfigEntity,
    UserEntity,
    TaskEntity,
];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'root',
            password: 'password',
            database: 'shitshup',
            schema: 'public',
            entities: moduleEntities,
            // synchronize: true,
        }),
    ],
    exports: [
        TypeOrmModule,
    ]
})
export class PersistenceModule {}
