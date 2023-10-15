import { Module, Scope } from '@nestjs/common';
import { NotionConfigService } from './config/notion-config.service';
import { NotionController } from './notion.controller';
import { NotionConfigMapper } from '../dao/notion/mapper/notion-config.mapper';
import { NotionConfigController } from './config/notion-config.controller';
import { NotionService } from './notion.service';
import { NotionDatabaseRepository } from '../dao/notion/notion-database.repository';
import { NotionDatabaseMapper } from '../dao/notion/mapper/notion-database.mapper';
import { NotionClientWrapper } from './notion-client.wrapper';
import { NotionPersistenceModule } from '../dao/notion/notion-persistence.module';
import { NotionClientInitializer } from './notion-client.initializer';
import { NotionPropertiesMapper } from '../dao/notion/mapper/notion-properties.mapper';

export function notionClientInit(notionClientInitializer: NotionClientInitializer) {
    return notionClientInitializer.notionClientFactory();
}

@Module({
    controllers: [
        NotionController,
        NotionConfigController,
    ],
    providers: [
        NotionConfigService,
        NotionConfigMapper,
        NotionPropertiesMapper,

        NotionService,
        NotionDatabaseRepository,
        NotionDatabaseMapper,

        NotionClientInitializer,

        {
            provide: NotionClientWrapper,
            useFactory: notionClientInit,
            inject: [NotionClientInitializer],
            scope: Scope.REQUEST,
        },
    ],
    imports: [
        NotionPersistenceModule,
    ],
    exports: [
        NotionService,
    ]
})
export class NotionModule {}