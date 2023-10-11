import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './youtube/entity/youtube-user.entity';
import { NotionConfigEntity } from './notion/entity/notion-config.entity';
import { UserEntity } from './user/entity/user.entity';

const moduleEntities: any[] = [
    YoutubeUserEntity,
    NotionConfigEntity,
    UserEntity,
];

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'rootroot',
            database: 'shitshup',
            entities: moduleEntities,
            // synchronize: true,
        }),
    ],
    exports: [
        TypeOrmModule,
    ]
})
export class PersistenceModule {}
