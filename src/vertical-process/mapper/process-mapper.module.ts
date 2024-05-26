import { Module } from '@nestjs/common';
import { ProcessMapper } from './process.mapper';
import { ProcessTrackMapper } from './process-track.mapper';
import { ProcessStepMapper } from './process-step.mapper';

@Module({
    providers: [
        ProcessMapper,
        ProcessTrackMapper,
        ProcessStepMapper,
    ],
    exports: [
        ProcessMapper,
        ProcessTrackMapper,
        ProcessStepMapper,
    ]
})
export class ProcessMapperModule {

}