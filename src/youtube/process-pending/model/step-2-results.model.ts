import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';

export class Step2Results {
    fileInfos: FileInfo[];
    idsNotDownloaded: string[];
}