import { Injectable } from '@nestjs/common';
import { DropboxRepository } from '../dao/dropbox/dropbox-repository';

@Injectable()
export class DropboxService {

    private readonly END_USER_DOMAIN = 'www.dropbox.com';
    private readonly DIRECT_DOWNLOAD_DOMAIN = 'dl.dropboxusercontent.com';

    constructor(private readonly dropboxRepository: DropboxRepository) {
    }

    async uploadFileToCloud(fileName: string, filePath: string): Promise<string | undefined> {
        const fileMetadata = await this.dropboxRepository.uploadFile(fileName, filePath);

        return fileMetadata.path_display;
    }

    async createSharingLink(dropboxFilePath: string): Promise<string> {
        const sharingResult = await this.dropboxRepository.createSharingLink(dropboxFilePath);

        const sharingEndUserUrl = sharingResult.url;
        const sharingDirectDownloadUrl = sharingEndUserUrl.replace(this.END_USER_DOMAIN, this.DIRECT_DOWNLOAD_DOMAIN);

        return sharingDirectDownloadUrl;
    }

}