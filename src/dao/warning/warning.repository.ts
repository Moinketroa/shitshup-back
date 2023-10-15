import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WarningEntity } from './entity/warning.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity'

@Injectable()
export class WarningRepository extends Repository<WarningEntity>{

    constructor(
        @InjectRepository(WarningEntity) repository: Repository<WarningEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async getWarnings(user: UserEntity): Promise<WarningEntity[]> {
        return await this.find({
            where: {
                user: user,
            },
            relations: [
                'user'
            ],
        });
    }

}