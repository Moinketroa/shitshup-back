import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './youtube/entity/youtube-user.entity';
import { NotionConfigEntity } from './notion/entity/notion-config.entity';

const moduleEntities: any[] = [
    YoutubeUserEntity,
    NotionConfigEntity,
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
