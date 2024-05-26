import { Injectable } from '@nestjs/common';
import { AbstractProcessStepRepository } from './abstract-process-step.repository';
import { ProcessStep7Entity } from './entity/process-step-7.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProcessStep7Repository extends AbstractProcessStepRepository<ProcessStep7Entity> {

    constructor(
        @InjectRepository(ProcessStep7Entity) repository: Repository<ProcessStep7Entity>
    ) {
        super(repository);
    }

}