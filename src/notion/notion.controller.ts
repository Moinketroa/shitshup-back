import { Controller, Get, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { NotionDatabase } from '../dao/notion/entity/notion-database.entity';

@Controller('notion')
export class NotionController {

    constructor(private readonly notionService: NotionService) {
    }

    @Get('mediaLibrary')
    getMediaLibrary(): Promise<NotionDatabase | null> {
        return this.notionService.getMediaLibrary();
    }

    @Post('mediaLibrary')
    postMediaLibrary(): Promise<NotionDatabase> {
        return this.notionService.generateMediaLibrary();
    }
}
