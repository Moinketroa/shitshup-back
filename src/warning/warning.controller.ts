import { Controller, Get, UseGuards } from '@nestjs/common';
import { WarningService } from './warning.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Warning } from './model/warning.model';

@Controller({
    path: 'warnings',
})
@UseGuards(AuthGuard)
export class WarningController {

    constructor(private readonly warningService: WarningService) {
    }

    @Get()
    getAllWarnings(): Promise<Warning[]> {
        return this.warningService.getAllWarning();
    }
}