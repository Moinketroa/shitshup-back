import { Injectable } from '@nestjs/common';
import { ProcessEntity } from '../../dao/process/entity/process.entity';
import { Process } from '../model/process.model';
import { DateTime } from 'luxon';
import { ProcessTrackMapper } from './process-track.mapper';

@Injectable()
export class ProcessMapper {

    constructor(private readonly processTrackMapper: ProcessTrackMapper) {
    }

    fromEntity(processEntity: ProcessEntity): Process {
        return <Process>{
            id: processEntity.id,
            createdAt: DateTime.fromJSDate(processEntity.createdAt, { zone: 'utc' }).toISO(),
            processTracks: processEntity.processTracks?.map(processTrackEntity => this.processTrackMapper.fromEntity(processTrackEntity)),

            hasStep2: true,
            hasStep3: processEntity.processRequest.doDeleteFromPending,
            hasStep4: processEntity.processRequest.doFetchMusicAnalysisData,
            hasStep5: processEntity.processRequest.doPushResultsToNotion,
            hasStep6: processEntity.processRequest.doLinkNotionToDropbox,
            hasStep7: processEntity.processRequest.doPredictStems,
        }
    }

}