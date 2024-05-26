import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStep3Entity } from './entity/process-step-3.entity';
import { AbstractProcessStepRepository } from './abstract-process-step.repository';

@Injectable()
export class ProcessStep3Repository extends AbstractProcessStepRepository<ProcessStep3Entity> {

    constructor(
        @InjectRepository(ProcessStep3Entity) repository: Repository<ProcessStep3Entity>
    ) {
        super(repository);
    }

}