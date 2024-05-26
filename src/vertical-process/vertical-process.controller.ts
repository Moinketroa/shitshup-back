import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DropboxAuthGuard } from '../auth/dropbox-auth/guard/dropbox-auth.guard';
import { YoutubeUserParam } from '../auth/youtube-auth/youtube-user.decorator';
import { YoutubeUser } from '../auth/youtube-auth/model/youtube-user.model';
import { ProcessRequest } from '../youtube/process/model/process-request.model';
import { ProcessEntity } from '../dao/process/entity/process.entity';
import { VerticalProcessService } from './vertical-process.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Process } from './model/process.model';

@Controller('vertical-process')
@UseGuards(AuthGuard)
export class VerticalProcessController {

    constructor(private readonly verticalProcessService: VerticalProcessService) {
    }

    @Get()
    getAllProcesses(): Promise<Process[]> {
        return this.verticalProcessService.getAllProcesses();
    }

    @Post('trigger')
    @UseGuards(DropboxAuthGuard)
    verticalProcess(@YoutubeUserParam() youtubeUser: YoutubeUser, @Body() processRequest: ProcessRequest): Promise<ProcessEntity> {
        ProcessRequest.validateProcessRequest(processRequest);

        return this.verticalProcessService.triggerVerticalProcess(youtubeUser, processRequest);
    }
}