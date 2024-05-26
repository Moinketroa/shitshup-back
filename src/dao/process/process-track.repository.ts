import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProcessTrackEntity } from './entity/process-track.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class ProcessTrackRepository extends Repository<ProcessTrackEntity> {

    constructor(
        @InjectRepository(ProcessTrackEntity) repository: Repository<ProcessTrackEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async getExplicitDuplicates(videoIds: string[], user: UserEntity): Promise<string[]> {
        if (videoIds.length === 0) {
            return videoIds;
        }

        const explicitDuplicates = await this.createQueryBuilder('processTrack')
            .select('processTrack.videoId')
            .where('processTrack.videoId IN (:...videoIds)', { videoIds })
            .andWhere('processTrack.user = :user', { user: user.id })
            .getRawMany();

        return explicitDuplicates.map(processTrack => processTrack['processTrack_videoId']);
    }

    getFullById(processTrackId: string): Promise<ProcessTrackEntity | null> {
        return this.findOne({
            where: { id: processTrackId },
            relations: {
                rootProcess: true,
                processStep2: true,
                processStep3: true,
                processStep4: true,
                processStep5: true,
                processStep6: true,
                processStep7: true,
            }
        })
    }
}