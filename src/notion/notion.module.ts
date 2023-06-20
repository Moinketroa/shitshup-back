import { Module } from '@nestjs/common';
import { NotionService } from './notion.service';
import { NotionController } from './notion.controller';
import { NotionConfigEntity } from '../dao/entity/notion-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotionConfigMapper } from '../dao/mapper/notion-config.mapper';
import { NotionConfigController } from './notion-config.controller';

@Module({
    controllers: [
        NotionController,
        NotionConfigController,
    ],
    providers: [
        NotionService,
        NotionConfigMapper,
    ],
    imports: [
        TypeOrmModule.forFeature([NotionConfigEntity]),
    ]
})
export class NotionModule {}