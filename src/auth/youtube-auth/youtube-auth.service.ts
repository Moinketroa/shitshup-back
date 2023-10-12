import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YoutubeUserEntity } from '../../dao/youtube/entity/youtube-user.entity';
import { Repository } from 'typeorm';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as process from 'process';
import { YoutubeUser } from './model/youtube-user.model';
import { YoutubeUserMapper } from '../../dao/youtube/mapper/youtube-user.mapper';
import { isDefined, isNullOrUndefined } from '../../util/util';
import { User } from '../model/user.model';

@Injectable()
export class YoutubeAuthService {

    private readonly youtubeScopes: string[];

    constructor(
        private readonly oAuth2Client: OAuth2Client,
        private readonly youtubeUserMapper: YoutubeUserMapper,
        @InjectRepository(YoutubeUserEntity) private readonly youtubeUserRepository: Repository<YoutubeUserEntity>,
    ) {
        this.youtubeScopes = JSON.parse(process.env.GOOGLE_SCOPES!);
    }

    generateAuthUrl() {
        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.youtubeScopes,
            prompt: 'consent',
        });
    }

    async callback(code: string) {
        const tokenResponse = await this.oAuth2Client.getToken(code);
        const credentials = tokenResponse.tokens;

        this.oAuth2Client.setCredentials(credentials);

        const youtubeUser = await this.login(credentials.id_token!);

        return <User>{
            youtubeUserId: youtubeUser.id,
            email: youtubeUser.email!,
            googleAccessToken: credentials.access_token!,
            googleRefreshToken: credentials.refresh_token!,
        };
    }

    async logout() {
        try {
            await this.oAuth2Client.revokeCredentials();
        } catch {
            return;
        }
    }

    me(): Promise<YoutubeUser | null> {
        return this.getCurrentUser();
    }

    async getCurrentUser(): Promise<YoutubeUser | null> {
        try {
            const accessToken = await this.oAuth2Client.getAccessToken();
            const tokenInfo = await this.oAuth2Client.getTokenInfo(accessToken.token!);

            const userFound = await this.youtubeUserRepository.findOneBy({
                email: tokenInfo.email,
            });

            return this.youtubeUserMapper.mapFromEntity(userFound!);
        } catch (e) {
            return null;
        }
    }

    private async login(idToken: string): Promise<YoutubeUser> {
        const loginTicket = await this.oAuth2Client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const youtubeUser = this.mapPayloadToYoutubeUser(
            loginTicket.getPayload()!,
        );

        const validatedYoutubeUserEntity = await this.validateUser(youtubeUser);

        return this.youtubeUserMapper.mapFromEntity(validatedYoutubeUserEntity);
    }

    private mapPayloadToYoutubeUser(payload: TokenPayload): YoutubeUser {
        return <YoutubeUser>{
            googleId: payload.iss,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            displayName: payload.name,
            photoUrl: payload.picture,
        };
    }

    private async validateUser(youtubeUser: YoutubeUser): Promise<YoutubeUserEntity> {
        const userFound = await this.youtubeUserRepository.findOneBy({
            email: youtubeUser.email,
        });

        if (isDefined(userFound)) {
            // TODO: update user
            return userFound;
        } else {
            const newUser = this.youtubeUserRepository.create(
                this.youtubeUserMapper.mapToEntity(youtubeUser),
            );
            return this.youtubeUserRepository.save(newUser);
        }
    }

    updateUserPlaylists(
        youtubeUser: YoutubeUser,
        pendingPlaylistId: string,
        processedPlaylistId: string,
        waitingPlaylistId: string,
    ): Promise<any> {
        const youtubeUserUpdate: Partial<YoutubeUserEntity> = {
            pendingPlaylistId,
            processedPlaylistId,
            waitingPlaylistId,
        };

        if (isNullOrUndefined(youtubeUser.id)) {
            throw new NotFoundException();
        } else {
            return this.youtubeUserRepository.update(youtubeUser.id, youtubeUserUpdate);
        }
    }

    async findYoutubeUser(youtubeUserId: string | undefined): Promise<YoutubeUserEntity | null> {
        return isDefined(youtubeUserId)
            ? this.youtubeUserRepository.findOne({
                  where: {
                      id: youtubeUserId,
                  },
                  relations: {
                      user: true,
                  },
              })
            : null;
    }
}
