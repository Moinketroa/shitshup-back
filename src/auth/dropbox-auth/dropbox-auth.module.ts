import { Module } from '@nestjs/common';
import { DropboxClientModule } from './dropbox-client.module';
import { DropboxPersistenceModule } from '../../dao/dropbox/dropbox-persistence.module';
import { DropboxAuthService } from './dropbox-auth.service';
import { AuthModule } from '../auth.module';
import { DropboxUserMapper } from './mapper/dropbox-user.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropboxUserEntity } from '../../dao/dropbox/entity/dropbox-user.entity';
import { DropboxAuthController } from './dropbox-auth.controller';

@Module({
    imports: [
        DropboxClientModule,
        DropboxPersistenceModule,

        AuthModule,

        TypeOrmModule.forFeature([DropboxUserEntity]),
    ],
    controllers: [
        DropboxAuthController,
    ],
    providers: [
        DropboxAuthService,

        DropboxUserMapper,
    ],
    exports: [
        DropboxAuthService,
    ]
})
export class DropboxAuthModule {}