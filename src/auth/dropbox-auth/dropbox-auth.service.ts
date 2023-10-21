import { Injectable } from '@nestjs/common';
import { DropboxAuth } from 'dropbox';
import * as process from 'process';
import { DropboxRepository } from '../../dao/dropbox/dropbox-repository';
import { AuthService } from '../auth.service';
import { isDefined, isNullOrUndefined } from '../../util/util';
import { DropboxUserMapper } from './mapper/dropbox-user.mapper';
import { Repository } from 'typeorm';
import { DropboxUserEntity } from '../../dao/dropbox/entity/dropbox-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DropboxUser } from './model/dropbox-user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DropboxAuthService {

    private readonly DROPBOX_REDIRECT_URL: string;

    constructor(private readonly dropboxAuth: DropboxAuth,
                private readonly dropboxRepository: DropboxRepository,
                private readonly dropboxUserMapper: DropboxUserMapper,
                @InjectRepository(DropboxUserEntity) private readonly dropboxUserRepository: Repository<DropboxUserEntity>,
                private readonly authService: AuthService) {
        this.DROPBOX_REDIRECT_URL = process.env.DROPBOX_REDIRECT_URL || '';
    }

    generateAuthUrl() {
        return this.dropboxAuth.getAuthenticationUrl(
            this.DROPBOX_REDIRECT_URL,
            uuidv4(),
            'code',
            'offline',
        );
    }

    async callback(code: string): Promise<void> {
        const dropboxResponse = await this.dropboxAuth.getAccessTokenFromCode(
            this.DROPBOX_REDIRECT_URL,
            code,
        );
        const authResult: any = dropboxResponse.result;

        this.dropboxAuth.setAccessToken(authResult.access_token);
        this.dropboxAuth.setRefreshToken(authResult.refresh_token);

        this.dropboxAuth.refreshAccessToken();

        await this.login();
    }

    async login(): Promise<void> {
        const currentUser = await this.authService.getCurrentUser();
        const alreadyPresentDropboxUserId = currentUser?.dropboxUser?.id;
        const account = await this.dropboxRepository.getAccountInfos();

        const dropboxUserEntity = this.dropboxUserMapper.toEntityFromAccount(
            account,
            currentUser!,
            this.dropboxAuth.getRefreshToken(),
            this.dropboxAuth.getAccessToken(),
        );

        if (isDefined(alreadyPresentDropboxUserId)) {
            dropboxUserEntity.id = alreadyPresentDropboxUserId;

            await this.dropboxUserRepository.update(alreadyPresentDropboxUserId, {
                ...dropboxUserEntity,
                user: undefined,
            })
        } else {
            await this.dropboxUserRepository.save(dropboxUserEntity);
        }
    }

    async validate(): Promise<boolean> {
        const currentUser = await this.authService.getCurrentUser();
        const currentDropboxUser = currentUser?.dropboxUser;

        if (isNullOrUndefined(currentDropboxUser)) {
            return false;
        } else {
            this.dropboxAuth.setAccessToken(currentDropboxUser.accessToken);
            this.dropboxAuth.setRefreshToken(currentDropboxUser.refreshToken);

            this.dropboxAuth.refreshAccessToken();

            await this.login();

            return true;
        }
    }

    async me(): Promise<DropboxUser> {
        const currentUser = await this.authService.getCurrentUser();

        return this.dropboxUserMapper.fromEntity(currentUser?.dropboxUser!);
    }

}