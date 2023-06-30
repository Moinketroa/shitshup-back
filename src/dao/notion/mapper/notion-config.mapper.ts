import { Injectable } from '@nestjs/common';
import { NotionConfigEntity } from '../entity/notion-config.entity';
import { ReadNotionConfigDTO } from '../../../notion/config/model/read-notion-config.dto';
import { CreateNotionConfigDTO } from '../../../notion/config/model/create-notion-config.dto';

@Injectable()
export class NotionConfigMapper {

    mapToEntity(createNotionConfig: CreateNotionConfigDTO): NotionConfigEntity {
        return <NotionConfigEntity>{
            internalIntegrationToken: createNotionConfig.internalIntegrationToken,
            rootBlockId: createNotionConfig.rootBlockId,
        }
    }

    mapFromEntity(notionConfigEntity: NotionConfigEntity): ReadNotionConfigDTO {
        return <ReadNotionConfigDTO>{
            id: notionConfigEntity.id,
            tokenHint: this.maskToken(notionConfigEntity.internalIntegrationToken),
            rootBlock: notionConfigEntity.rootBlockId,
            mediaLibraryDatabase: notionConfigEntity.mediaLibraryDatabaseId,
        }
    }

    private maskToken(token: string): string {
        const maskedPart = '*'.repeat(token.length - 4);
        const lastFourChars = token.slice(-4);
        return maskedPart + lastFourChars;
    }

}