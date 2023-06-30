import { Injectable } from '@nestjs/common';
import { NotionConfigEntity } from './entity/notion-config.entity';
import { Repository } from 'typeorm';
import { isDefined } from '../../util/util';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotionConfigRepository extends Repository<NotionConfigEntity>{

    constructor(
        @InjectRepository(NotionConfigEntity) repository: Repository<NotionConfigEntity>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    findFirst(id?: string): Promise<null | NotionConfigEntity> {
        return isDefined(id)
            ? this.findById(id)
            : this.findFirstWithoutId();
    }

    private async findFirstWithoutId(): Promise<null | NotionConfigEntity> {
        const notionConfigsFound = await this.find({
            take: 1,
        });

        return notionConfigsFound.length === 0
            ? null
            : notionConfigsFound[0];
    }

    private findById(id: string): Promise<null | NotionConfigEntity> {
        return this.findOne({
            where: { id },
        });
    }
}