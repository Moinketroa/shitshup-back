import { NotionDatabaseRepository } from '../dao/notion/notion-database.repository';
import { NotionDatabase } from '../dao/notion/entity/notion-database.entity';
import { Injectable } from '@nestjs/common';
import { NotionConfigService } from './config/notion-config.service';
import { isNullOrUndefined } from '../util/util';
import { MusicDataAnalysisResult } from '../youtube/process/model/music-data-analysis-result.model';
import { NotionPropertiesMapper } from '../dao/notion/mapper/notion-properties.mapper';

@Injectable()
export class NotionService {

    constructor(
        private readonly notionDatabaseRepository: NotionDatabaseRepository,
        private readonly notionConfigService: NotionConfigService,
        private readonly notionPropertiesMapper: NotionPropertiesMapper,
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

    async addRowToMediaLibrary(musicDataAnalysisResult: MusicDataAnalysisResult): Promise<string> {
        const mediaLibrary = await this.getMediaLibrary();
        const rawMediaLibraryDatabaseStructure = await this.notionDatabaseRepository.fetchRawDatabase(mediaLibrary?.id!);

        const propertiesRowToAdd = this.notionPropertiesMapper.toNotionProperties(musicDataAnalysisResult, rawMediaLibraryDatabaseStructure.properties);

        const createPageResponse = await this.notionDatabaseRepository.createRow(mediaLibrary?.id!, propertiesRowToAdd);

        return createPageResponse.id;
    }

    async linkFileToPage(pageId: string, fileLink: string) {
        await this.notionDatabaseRepository.appendExternalFileToBlock(
            pageId,
            fileLink,
        );
    }
}