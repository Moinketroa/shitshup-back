import { Module, Scope } from '@nestjs/common';
import { ModuleConfigService } from '../module-config.service';
import { OAuth2Client } from 'google-auth-library';

export function oAuth2ClientInit(moduleConfigServiceConfig: ModuleConfigService) {
    const env = moduleConfigServiceConfig.config;

    return new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URL,
    );
}

@Module({
    providers: [
        ModuleConfigService,

        {
            provide: OAuth2Client,
            useFactory: oAuth2ClientInit,
            inject: [ ModuleConfigService ],
            scope: Scope.REQUEST,
        },
    ],
    exports: [
        OAuth2Client,
    ]
})
export class OAuth2ClientModule {}