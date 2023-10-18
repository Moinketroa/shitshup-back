import { Injectable } from '@nestjs/common';
import { WarningRepository } from '../dao/warning/warning.repository';
import { AuthService } from '../auth/auth.service';
import { WarningMapper } from './mapper/warning.mapper';
import { WarningType } from './model/warning-type.enum';
import { Warning } from './model/warning.model';

@Injectable()
export class WarningService {

    constructor(private readonly warningRepository: WarningRepository,
                private readonly warningMapper: WarningMapper,
                private readonly authService: AuthService,) {
    }

    async createWarning(videoId: string, warningType: WarningType, warningMessage: string): Promise<void> {
        const currentUser = await this.authService.getCurrentUser();

        const warningToCreate = this.warningMapper.buildEntity(
            videoId,
            warningType,
            warningMessage,
            currentUser!,
        );

        await this.warningRepository.save(warningToCreate);
    }

    async deleteWarning(warningId: string): Promise<void> {
        await this.warningRepository.delete(warningId);
    }

    async getAllWarning(): Promise<Warning[]> {
        const currentUser = await this.authService.getCurrentUser();

        const warnings = await this.warningRepository.getWarnings(currentUser!);

        return warnings.map(warning => this.warningMapper.fromEntity(warning));
    }

}