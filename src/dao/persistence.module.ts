import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeUserEntity } from './entity/youtube-user.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'rootroot',
            database: 'shitshup',
            entities: [YoutubeUserEntity],
            synchronize: true,
        }),
    ],
    exports: [
        TypeOrmModule,
    ]
})
export class PersistenceModule {}
