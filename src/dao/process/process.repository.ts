import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessEntity } from './entity/process.entity';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class ProcessRepository extends Repository<ProcessEntity> {

    constructor(
        @InjectRepository(ProcessEntity) repository: Repository<ProcessEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    getAll(user: UserEntity): Promise<ProcessEntity[]> {
        return this.find({
            where: {
                user: {
                    id: user.id,
                },
            },
            relations: {
                processTracks: {
                    processStep2: true,
                    processStep3: true,
                    processStep4: true,
                    processStep5: true,
                    processStep6: true,
                    processStep7: true,
                },
            },
        });
    }

}