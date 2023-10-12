import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionConfigEntity } from './entity/notion-config.entity';
import { NotionConfigRepository } from './notion-config.repository';
import { NotionDatabaseRepository } from './notion-database.repository';
import { NotionDatabaseMapper } from './mapper/notion-database.mapper';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotionConfigEntity]),
    ],
    providers: [
        NotionConfigRepository,

        NotionDatabaseRepository,
        NotionDatabaseMapper,
    ],
    exports: [
        NotionConfigRepository,
        NotionDatabaseRepository,
    ]
})
export class NotionPersistenceModule {

}