import { Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as fs from 'fs';
import { DropboxAccount, DropboxFileMetadata } from './type/dropbox-client.type';

@Injectable()
export class DropboxRepository {

    constructor(private readonly dropboxClient: Dropbox) {
    }

    async uploadFile(fileName: string, filePath: string): Promise<DropboxFileMetadata> {
        const response = await this.dropboxClient.filesUpload({
            path: '/' + fileName,
            contents: fs.createReadStream(filePath),
        });

        return response.result;
    }

    async getAccountInfos(): Promise<DropboxAccount> {
        const response  = await this.dropboxClient.usersGetCurrentAccount()

        return response.result;
    }

}