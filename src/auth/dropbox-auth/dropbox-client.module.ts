import { Module, Scope } from '@nestjs/common';
import { ModuleConfigService } from '../../module-config.service';
import { Dropbox, DropboxAuth } from 'dropbox';

export function dropboxAuthInit(moduleConfigServiceConfig: ModuleConfigService) {
    const env = moduleConfigServiceConfig.config;

    return new DropboxAuth({
        clientId: env.DROPBOX_CLIENT_ID,
        clientSecret: env.DROPBOX_CLIENT_SECRET,
    });
}

export function dropboxInit(dropboxAuth: DropboxAuth) {
    return new Dropbox({
        auth: dropboxAuth,
    });
}

@Module({
    providers: [
        ModuleConfigService,

        {
            provide: DropboxAuth,
            useFactory: dropboxAuthInit,
            inject: [ ModuleConfigService ],
            scope: Scope.REQUEST,
        },

        {
            provide: Dropbox,
            useFactory: dropboxInit,
            inject: [ DropboxAuth ]
        },
    ],
    exports: [
        DropboxAuth,
        Dropbox,
    ]
})
export class DropboxClientModule {}