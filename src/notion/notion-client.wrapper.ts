import { Client as NotionClient } from '@notionhq/client';
import { NotFoundException } from '@nestjs/common';
import { isDefined } from '../util/util';

export class NotionClientWrapper {

    constructor(private readonly _client?: NotionClient) {}

    get client(): NotionClient {
        if (isDefined(this._client)) {
            return this._client;
        } else {
            throw new NotFoundException('No Internal Integration Token or No Config');
        }
    }

}
