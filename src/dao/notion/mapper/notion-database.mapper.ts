import { Injectable } from '@nestjs/common';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionDatabase } from '../entity/notion-database.entity';

@Injectable()
export class NotionDatabaseMapper {

    map(databaseResponse: DatabaseObjectResponse): NotionDatabase {
        return <NotionDatabase>{
            id: databaseResponse.id,
            title: databaseResponse.title[0]?.plain_text,
            description: databaseResponse.description[0]?.plain_text,
        };
    }

}