import { Injectable, NotFoundException } from '@nestjs/common';
import { NotionConfigEntity } from '../../dao/notion/entity/notion-config.entity';
import { NotionConfigMapper } from '../../dao/notion/mapper/notion-config.mapper';
import { ReadNotionConfigDTO } from './model/read-notion-config.dto';
import { CreateNotionConfigDTO } from './model/create-notion-config.dto';
import { UpdateNotionConfigDTO } from './model/update-notion-config.dto';
import { NotionConfigRepository } from '../../dao/notion/notion-config-repository';
import { isNullOrUndefined } from '../../util/util';

@Injectable()
export class NotionConfigService {

    constructor(
        private readonly notionConfigMapper: NotionConfigMapper,
        private readonly notionConfigRepository: NotionConfigRepository,
    ) {}

    async getConfig(id?: string): Promise<ReadNotionConfigDTO | null> {
        const notionConfigFound: NotionConfigEntity | null = await this.notionConfigRepository.findFirst(id);

        if (notionConfigFound === null) {
            return null;
        } else {
            return this.notionConfigMapper.mapFromEntity(notionConfigFound);
        }
    }

    async createConfig(createNotionConfig: CreateNotionConfigDTO): Promise<ReadNotionConfigDTO> {
        const notionConfigFound = await this.notionConfigRepository.findFirst();

        if (notionConfigFound === null) {
            const notionConfigCreated = await this.createNewNotionConfig(createNotionConfig);

            return this.notionConfigMapper.mapFromEntity(notionConfigCreated);
        } else {
            return this.notionConfigMapper.mapFromEntity(notionConfigFound);
        }
    }

    private createNewNotionConfig(createNotionConfig: CreateNotionConfigDTO): Promise<NotionConfigEntity> {
        const newNotionConfig = this.notionConfigRepository.create(
            this.notionConfigMapper.mapToEntity(createNotionConfig)
        );

        return this.notionConfigRepository.save(newNotionConfig);
    }

    async updateConfig(id: string, updateNotionConfig: UpdateNotionConfigDTO): Promise<ReadNotionConfigDTO | null> {
        const notionConfigFound = await this.notionConfigRepository.findFirst(id);

        if (isNullOrUndefined(notionConfigFound)) {
            throw new NotFoundException();
        } else {
            await this.notionConfigRepository.update(id, updateNotionConfig);

            return this.getConfig(id);
        }
    }

    async updateMediaLibraryConfig(mediaLibraryId: string): Promise<ReadNotionConfigDTO | null> {
        const notionConfigFound = await this.notionConfigRepository.findFirst();
        const notionConfigUpdate: Partial<NotionConfigEntity> = {
            mediaLibraryDatabaseId: mediaLibraryId,
        };

        if (isNullOrUndefined(notionConfigFound)) {
            throw new NotFoundException();
        } else {
            await this.notionConfigRepository.update(notionConfigFound.id, notionConfigUpdate);

            return this.getConfig(notionConfigFound.id);
        }
    }
}