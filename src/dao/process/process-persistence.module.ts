import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessEntity } from './entity/process.entity';
import { ProcessTrackEntity } from './entity/process-track.entity';
import { ProcessRepository } from './process.repository';
import { ProcessTrackRepository } from './process-track.repository';
import { ProcessStep2Repository } from './process-step-2.repository';
import { ProcessStep2Entity } from './entity/process-step-2.entity';
import { ProcessStep3Entity } from './entity/process-step-3.entity';
import { ProcessStep3Repository } from './process-step-3.repository';
import { ProcessStep4Entity } from './entity/process-step-4.entity';
import { ProcessStep4Repository } from './process-step-4.repository';
import { ProcessStep5Entity } from './entity/process-step-5.entity';
import { ProcessStep5Repository } from './process-step-5.repository';
import { ProcessStep6Repository } from './process-step-6.repository';
import { ProcessStep6Entity } from './entity/process-step-6.entity';
import { ProcessStep7Entity } from './entity/process-step-7.entity';
import { ProcessStep7Repository } from './process-step-7.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProcessEntity,
            ProcessTrackEntity,
            ProcessStep2Entity,
            ProcessStep3Entity,
            ProcessStep4Entity,
            ProcessStep5Entity,
            ProcessStep6Entity,
            ProcessStep7Entity,
        ]),
    ],
    providers: [
        ProcessRepository,
        ProcessTrackRepository,

        ProcessStep2Repository,
        ProcessStep3Repository,
        ProcessStep4Repository,
        ProcessStep5Repository,
        ProcessStep6Repository,
        ProcessStep7Repository,
    ],
    exports: [
        ProcessRepository,
        ProcessTrackRepository,

        ProcessStep2Repository,
        ProcessStep3Repository,
        ProcessStep4Repository,
        ProcessStep5Repository,
        ProcessStep6Repository,
        ProcessStep7Repository,
    ]
})
export class ProcessPersistenceModule {

}