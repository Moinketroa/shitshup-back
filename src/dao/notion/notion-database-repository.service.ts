import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionDatabaseMapper } from './mapper/notion-database.mapper';
import * as process from 'process';
import { NotionConfigEntity } from './entity/notion-config.entity';
import { NotionClientWrapper } from '../../notion/notion-client.wrapper';
import { NotionDatabase } from './entity/notion-database.entity';
import { NotionConfigRepository } from './notion-config-repository';
import { notionDatabaseSchema } from './schema/notion-database.schema';
import { DateTime } from 'luxon';

@Injectable()
export class NotionDatabaseRepository {
    private readonly DEFAULT_TABLE_NAME: string;
    private readonly DEFAULT_TABLE_ICON = '💿';

    constructor(
        @Optional() private readonly notionClientWrapper: NotionClientWrapper,
        private readonly notionConfigRepository: NotionConfigRepository,
        private readonly notionDatabaseMapper: NotionDatabaseMapper,
    ) {
        this.DEFAULT_TABLE_NAME = process.env.NOTION_DEFAULT_MEDIA_LIBRARY_TABLE_NAME ?? '';
    }

    async getMediaLibrary(): Promise<NotionDatabase | null> {
        const notionConfig: NotionConfigEntity | null = await this.notionConfigRepository.findFirst();

        if (notionConfig?.mediaLibraryDatabaseId) {
            const database: DatabaseObjectResponse = (await this.notionClientWrapper.client.databases.retrieve({
                database_id: notionConfig.mediaLibraryDatabaseId,
            })) as DatabaseObjectResponse;

            return this.notionDatabaseMapper.map(database);
        } else {
            return null;
        }
    }

    async createMediaLibrary(): Promise<NotionDatabase> {
        const notionConfig: NotionConfigEntity | null = await this.notionConfigRepository.findFirst();

        if (notionConfig?.rootBlockId) {
            const newDatabase: DatabaseObjectResponse = await this.createDatabase(notionConfig.rootBlockId);

            return this.notionDatabaseMapper.map(newDatabase);
        } else {
            throw new BadRequestException();
        }
    }

    private async createDatabase(parentId: string): Promise<DatabaseObjectResponse> {
        return await this.notionClientWrapper.client.databases.create({
            parent: {
                page_id: parentId,
                type: 'page_id',
            },
            icon: {
                emoji: this.DEFAULT_TABLE_ICON,
                type: 'emoji',
            },
            title: [
                {
                    type: 'text',
                    text: {
                        content: this.DEFAULT_TABLE_NAME,
                    },
                },
            ],
            description: [
                {
                    type: 'text',
                    text: {
                        content: this.creationDescription(),
                    },
                },
            ],
            properties: notionDatabaseSchema,
        }) as DatabaseObjectResponse;
    }

    private creationDescription(): string {
        const now = DateTime.now()
            .setLocale('fr')
            .toFormat('f');

        return `Created : ${now} - Modified : ${now}`;
    }
}
