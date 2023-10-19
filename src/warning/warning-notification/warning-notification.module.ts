import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WarningNotificationGateway } from './warning-notification.gateway';
import { WarningNotificationService } from './warning-notification.service';

@Module({
    imports: [
        AuthModule,
    ],
    providers: [
        WarningNotificationGateway,
        WarningNotificationService,
    ],
    exports: [
        WarningNotificationGateway
    ]
})
export class WarningNotificationModule {

}