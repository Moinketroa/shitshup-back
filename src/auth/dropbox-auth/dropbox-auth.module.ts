import { Module, Scope } from '@nestjs/common';
import { DropboxClientModule } from './dropbox-client.module';
import { DropboxPersistenceModule } from '../../dao/dropbox/dropbox-persistence.module';
import { DropboxAuthService } from './dropbox-auth.service';
import { AuthModule } from '../auth.module';
import { DropboxUserMapper } from './mapper/dropbox-user.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropboxUserEntity } from '../../dao/dropbox/entity/dropbox-user.entity';
import { DropboxAuthController } from './dropbox-auth.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DropboxAuthInterceptor } from './dropbox-auth.interceptor';
import { DropboxRefresherJob } from './dropbox-refresher.job';

@Module({
    imports: [
        DropboxClientModule,
        DropboxPersistenceModule,

        AuthModule.forRoot(),

        TypeOrmModule.forFeature([DropboxUserEntity]),
    ],
    controllers: [
        DropboxAuthController,
    ],
    providers: [
        DropboxAuthService,

        DropboxUserMapper,

        {
            provide: APP_INTERCEPTOR,
            useClass: DropboxAuthInterceptor,
            scope: Scope.REQUEST,
        },

        DropboxRefresherJob,
    ],
    exports: [
        DropboxAuthService,
    ]
})
export class DropboxAuthModule {}