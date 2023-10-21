import { Module } from '@nestjs/common';
import { ModuleConfigService } from '../../module-config.service';
import { DropboxRepository } from './dropbox-repository';
import { DropboxClientModule } from '../../auth/dropbox-auth/dropbox-client.module';

@Module({
    imports: [
        DropboxClientModule,
    ],
    providers: [
        DropboxRepository,

        ModuleConfigService,
    ],
    exports: [
        DropboxRepository,
    ]
})
export class DropboxPersistenceModule {

}