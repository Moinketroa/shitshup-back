import { Injectable } from '@nestjs/common';
import { DropboxRepository } from '../dao/dropbox/dropbox-repository';

@Injectable()
export class DropboxService {

    constructor(private readonly dropboxRepository: DropboxRepository) {
    }

    async uploadFileToCloud(fileName: string, filePath: string): Promise<any> {
        const res = await this.dropboxRepository.uploadFile(fileName, filePath);

        console.log(res);
    }

}