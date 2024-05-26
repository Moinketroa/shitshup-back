import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStep2Entity } from './entity/process-step-2.entity';
import { ProcessTrackEntity } from './entity/process-track.entity';
import { FileInfo } from '../youtube-downloader-python/model/file-info.model';
import { AbstractProcessStepRepository } from './abstract-process-step.repository';

@Injectable()
export class ProcessStep2Repository extends AbstractProcessStepRepository<ProcessStep2Entity> {

    constructor(
        @InjectRepository(ProcessStep2Entity) repository: Repository<ProcessStep2Entity>
    ) {
        super(repository);
    }

    async updateWithFileInfo(processStep: ProcessStep2Entity, fileInfo: FileInfo): Promise<void> {
        await this.update(
            processStep.id,
            {
                fileInfoId: fileInfo.id,
                fileInfoTrack: fileInfo.track,
                fileInfoArtist: fileInfo.artist,
                fileInfoFilePath: fileInfo.filePath,
            }
        );
    }

    async getFileInfoFromProcessTrack(processTrack: ProcessTrackEntity): Promise<FileInfo> {
        const processStep2 = await this.findOneBy({
            rootProcessTrack: { id: processTrack.id },
        });

        return <FileInfo>{
            id: processStep2?.fileInfoId,
            track: processStep2?.fileInfoTrack,
            artist: processStep2?.fileInfoArtist,
            filePath: processStep2?.fileInfoFilePath,
        }
    }
}