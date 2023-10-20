import { Module } from '@nestjs/common';
import { ModuleConfigService } from '../../module-config.service';
import { Dropbox } from 'dropbox';
import { DropboxRepository } from './dropbox-repository';

export function dropboxInit(moduleConfigServiceConfig: ModuleConfigService) {
    const env = moduleConfigServiceConfig.config;

    return new Dropbox({
        clientId: env.DROPBOX_CLIENT_ID,
        clientSecret: env.DROPBOX_CLIENT_SECRET,
        accessToken: env.DROPBOX_ACCESS_TOKEN
    });
}

@Module({
    providers: [
        DropboxRepository,

        ModuleConfigService,

        {
            provide: Dropbox,
            useFactory: dropboxInit,
            inject: [ ModuleConfigService ],
        },
    ],
    exports: [
        DropboxRepository
    ]
})
export class DropboxPersistenceModule {

}