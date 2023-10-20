import { Module } from '@nestjs/common';
import { DropboxPersistenceModule } from '../dao/dropbox/dropbox-persistence.module';
import { DropboxService } from './dropbox.service';

@Module({
    imports: [
        DropboxPersistenceModule,
    ],
    providers: [
        DropboxService,
    ],
    exports: [
        DropboxService,
    ]
})
export class DropboxModule {

}