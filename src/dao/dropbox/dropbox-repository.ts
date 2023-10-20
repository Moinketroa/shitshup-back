import { Injectable } from '@nestjs/common';
import { Dropbox, files } from 'dropbox';
import * as fs from 'fs';

@Injectable()
export class DropboxRepository {

    constructor(private readonly dropboxClient: Dropbox) {
    }

    async uploadFile(fileName: string, filePath: string): Promise<files.FileMetadata> {
        const response = await this.dropboxClient.filesUpload({
            path: '/' + fileName,
            contents: fs.createReadStream(filePath),
        });

        return response.result;
    }

}