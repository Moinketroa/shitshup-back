import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { ReadNotionConfigDTO } from './model/read-notion-config.dto';
import { CreateNotionConfigDTO } from './model/create-notion-config.dto';
import { UpdateNotionConfigDTO } from './model/update-notion-config.dto';

@Controller('notion/config')
export class NotionConfigController {
    constructor(private readonly notionService: NotionService) {}

    @Get()
    myConfig(): Promise<ReadNotionConfigDTO | null> {
        return this.notionService.getConfig();
    }

    @Post()
    createConfig(
        @Body() createNotionConfig: CreateNotionConfigDTO,
    ): Promise<ReadNotionConfigDTO> {
        return this.notionService.createConfig(createNotionConfig);
    }

    @Patch(':id')
    updateConfig(
        @Param('id') id: string,
        @Body() updateNotionConfig: UpdateNotionConfigDTO,
    ): Promise<any> {
        return this.notionService.updateConfig(id, updateNotionConfig);
    }
}
