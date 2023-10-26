import { isNullOrUndefined } from '../../../util/util';
import { BadRequestException } from '@nestjs/common';

export class ProcessRequest {
    processOneVideo: boolean;
    uniqueVideoId: string;

    doDeleteExplicitDuplicates: boolean;

    doFetchMusicAnalysisData: boolean;
    doDeleteFromPending: boolean;
    doPushResultsToNotion: boolean;
    doPredictStems: boolean;
    doLinkNotionToDropbox: boolean;

    static validateProcessRequest(processRequest: ProcessRequest): void {
        if (processRequest.processOneVideo && isNullOrUndefined(processRequest.uniqueVideoId)) {
            throw new BadRequestException();
        }

        if (processRequest.doDeleteFromPending && processRequest.processOneVideo) {
            throw new BadRequestException();
        }

        if (processRequest.doDeleteExplicitDuplicates && processRequest.processOneVideo) {
            throw new BadRequestException();
        }

        if (processRequest.doLinkNotionToDropbox && (!processRequest.doPushResultsToNotion || !processRequest.doFetchMusicAnalysisData)) {
            throw new BadRequestException();
        }

        if (processRequest.doPushResultsToNotion && !processRequest.doFetchMusicAnalysisData) {
            throw new BadRequestException();
        }
    }
}