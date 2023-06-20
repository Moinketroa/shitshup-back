import { Client } from '@notionhq/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotionConfigEntity } from '../dao/entity/notion-config.entity';
import { NotionConfigMapper } from '../dao/mapper/notion-config.mapper';
import { ReadNotionConfigDTO } from './model/read-notion-config.dto';
import { CreateNotionConfigDTO } from './model/create-notion-config.dto';
import { UpdateNotionConfigDTO } from './model/update-notion-config.dto';

@Injectable()
export class NotionService {

    //private notionClient: Client;

    constructor(
        private readonly notionConfigMapper: NotionConfigMapper,
        @InjectRepository(NotionConfigEntity) private readonly notionConfigRepository: Repository<NotionConfigEntity>,
    ) {
        // this.notionClient = new Client({
        //     auth: process.env.NOTION_INTERNAL_INTEGRATION_TOKEN,
        // });
    }

    async getConfig(id?: string): Promise<ReadNotionConfigDTO | null> {
        const notionConfigFound: NotionConfigEntity | null = !!id
            ? await this.getConfigEntityById(id)
            : await this.getFirstConfigEntity();

        if (notionConfigFound === null) {
            return null;
        } else {
            return this.notionConfigMapper.mapFromEntity(notionConfigFound);
        }
    }

    private async getFirstConfigEntity(): Promise<null | NotionConfigEntity> {
        const notionConfigsFound = await this.notionConfigRepository.find({
            take: 1,
        });

        return notionConfigsFound.length === 0
            ? null
            : notionConfigsFound[0];
    }

    private getConfigEntityById(id: string): Promise<null | NotionConfigEntity> {
        return this.notionConfigRepository.findOne({
            where: { id },
        });
    }

    async createConfig(createNotionConfig: CreateNotionConfigDTO): Promise<ReadNotionConfigDTO> {
        const notionConfigFound = await this.getFirstConfigEntity();

        if (notionConfigFound === null) {
            const notionConfigCreated = await this.createNewNotionConfig(createNotionConfig);

            return this.notionConfigMapper.mapFromEntity(notionConfigCreated);
        } else {
            return this.notionConfigMapper.mapFromEntity(notionConfigFound);
        }
    }

    private createNewNotionConfig(createNotionConfig: CreateNotionConfigDTO): Promise<NotionConfigEntity> {
        const newNotionConfig = this.notionConfigRepository.create(
            this.notionConfigMapper.mapToEntity(createNotionConfig)
        );

        return this.notionConfigRepository.save(newNotionConfig);
    }

    async updateConfig(id: string, updateNotionConfig: UpdateNotionConfigDTO): Promise<any> {
        const notionConfigFound = await this.getConfigEntityById(id);

        if (!notionConfigFound) {
            throw NotFoundException;
        } else {
            await this.notionConfigRepository.update(id, updateNotionConfig);

            return this.getConfig(id);
        }
    }

    test(): any {
        const test = 'f90bb0a7244948a78d71cba43ba77c0d';
        const shitshup = '6139a98827de4101a500dd1d4dbc3e55';
        const rootPage = '2cfb26c2d4274fc791c91638749c8a7e';

        // return this.notionClient.databases.query({
        //     database_id: shitshup,
        // });

        // return this.notionClient.blocks.children.list({
        //     block_id: rootPage,
        // });

        //return this.notionClient.blocks.retrieve({});
    }

}