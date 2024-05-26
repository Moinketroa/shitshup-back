import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { VerticalProcessNotificationService } from './vertical-process-notification.service';
import { VerticalProcessNotificationGateway } from './vertical-process-notification.gateway';
import { ProcessPersistenceModule } from '../../dao/process/process-persistence.module';
import { ProcessMapperModule } from '../mapper/process-mapper.module';

@Module({
    imports: [
        AuthModule.forRoot(),

        ProcessMapperModule,
        ProcessPersistenceModule,
    ],
    providers: [
        VerticalProcessNotificationGateway,
        VerticalProcessNotificationService,
    ],
    exports: [
        VerticalProcessNotificationGateway
    ]
})
export class VerticalProcessNotificationModule {

}