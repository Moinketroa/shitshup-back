import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractProcessStepRepository } from './abstract-process-step.repository';
import { ProcessStep6Entity } from './entity/process-step-6.entity';

@Injectable()
export class ProcessStep6Repository extends AbstractProcessStepRepository<ProcessStep6Entity> {

    constructor(
        @InjectRepository(ProcessStep6Entity) repository: Repository<ProcessStep6Entity>
    ) {
        super(repository);
    }

}