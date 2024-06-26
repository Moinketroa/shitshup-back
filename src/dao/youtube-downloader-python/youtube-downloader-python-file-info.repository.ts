import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { FileInfo } from './model/file-info.model';

@Injectable()
export class YoutubeDownloaderPythonFileInfoRepository {

    private readonly logger = new Logger(YoutubeDownloaderPythonFileInfoRepository.name);

    async getFileInfos(filePath: string, progressStepCallback: () => void): Promise<FileInfo[]> {
        try {
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            const lines = fileContent.split('\n');
            const fileInfos: FileInfo[] = [];

            this.logger.debug(`${ lines.length } lines to read`);

            for (const line of lines) {
                if (line.length !== 0) {
                    const fileInfo: FileInfo = this.parseLine(line);
                    fileInfos.push(fileInfo);

                    progressStepCallback.call(this);
                }
            }

            return fileInfos;
        } catch (error) {
            throw new Error('Error reading or parsing the file.');
        }
    }

    async getFileInfo(filePath: string): Promise<FileInfo> {
        try {
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            this.logger.debug(`${ lines.length } lines to read`);

            for (const line of lines) {
                if (line.length !== 0) {
                    return this.parseLine(line);
                }
            }

            throw new Error(`Can't find any info.`);
        } catch (error) {
            throw new Error('Error reading or parsing the file.');
        }
    }

    private parseLine(line: string): FileInfo {
        const fileInfo = new FileInfo();

        const idKey = 'id=';
        const trackKey = 'track=';
        const artistKey = 'artist=';
        const fileNameKey = 'filepath='

        const idKeyIndex = line.indexOf(idKey)
        const trackKeyIndex = line.indexOf(trackKey);
        const artistKeyIndex = line.indexOf(artistKey);
        const fileNameKeyIndex = line.indexOf(fileNameKey);

        fileInfo.id = line.substring(idKeyIndex + idKey.length, trackKeyIndex - 1);
        fileInfo.track = line.substring(trackKeyIndex + trackKey.length, artistKeyIndex - 1);
        fileInfo.artist = line.substring(artistKeyIndex + artistKey.length, fileNameKeyIndex - 1);
        fileInfo.filePath = line.substring(fileNameKeyIndex + fileNameKey.length);

        return fileInfo;
    }

}