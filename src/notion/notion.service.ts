import { NotionDatabaseRepository } from '../dao/notion/notion-database.repository';
import { NotionDatabase } from '../dao/notion/entity/notion-database.entity';
import { Injectable } from '@nestjs/common';
import { NotionConfigService } from './config/notion-config.service';
import { isNullOrUndefined } from '../util/util';

@Injectable()
export class NotionService {

    constructor(
        private readonly notionDatabaseRepository: NotionDatabaseRepository,
        private readonly notionConfigService: NotionConfigService,
    ) {
    }

    getMediaLibrary(): Promise<NotionDatabase | null> {
        return this.notionDatabaseRepository.getMediaLibrary();
    }

    async generateMediaLibrary(): Promise<NotionDatabase> {
        const notionDatabase: NotionDatabase | null = await this.notionDatabaseRepository.getMediaLibrary();

        if (isNullOrUndefined(notionDatabase)) {
            const newNotionDatabase: NotionDatabase = await this.notionDatabaseRepository.createMediaLibrary();

            await this.notionConfigService.updateMediaLibraryConfig(newNotionDatabase.id);

            return newNotionDatabase;
        } else {
            return notionDatabase;
        }
    }
}