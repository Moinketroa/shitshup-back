import { Injectable } from '@nestjs/common';
import { NotionConfigRepository } from '../dao/notion/notion-config-repository';
import { NotionClientWrapper } from './notion-client.wrapper';
import { Client as NotionClient } from '@notionhq/client';

@Injectable()
export class NotionClientInitializer {

    constructor(private readonly notionConfigRepository: NotionConfigRepository) {
    }

    async notionClientFactory(): Promise<NotionClientWrapper> {
        const notionConfig = await this.notionConfigRepository.findFirst();

        if (notionConfig?.internalIntegrationToken) {
            const notionClient = new NotionClient({
                auth: notionConfig.internalIntegrationToken,
            });

            return new NotionClientWrapper(notionClient);
        } else {
            return new NotionClientWrapper();
        }
    }
}
