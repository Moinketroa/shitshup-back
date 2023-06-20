import { Controller, Get, Request } from '@nestjs/common';
import { NotionService } from './notion.service';

@Controller('notion')
export class NotionController {

    constructor(private readonly notionService: NotionService) {
    }

    @Get('test')
    test(@Request() req: any): any {
        return this.notionService.test();
    }
}
