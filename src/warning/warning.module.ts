import { Module } from '@nestjs/common';
import { WarningPersistenceModule } from '../dao/warning/warning-persistence.module';
import { WarningService } from './warning.service';
import { WarningMapper } from './mapper/warning.mapper';
import { WarningController } from './warning.controller';
import { AuthModule } from '../auth/auth.module';
import { WarningNotificationModule } from './warning-notification/warning-notification.module';

@Module({
    imports: [
        WarningPersistenceModule,
        WarningNotificationModule,
        AuthModule.forRoot(),
    ],
    controllers: [
        WarningController,
    ],
    providers: [
        WarningService,
        WarningMapper,
    ],
    exports: [
        WarningService,
    ]
})
export class WarningModule {

}