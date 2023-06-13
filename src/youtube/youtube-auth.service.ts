import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YoutubeUserEntity } from '../dao/entity/youtube-user.entity';
import { Repository } from 'typeorm';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as process from 'process';
import { YoutubeUser } from './model/youtube-user.model';
import { YoutubeUserMapper } from '../dao/mapper/youtube-user.mapper';

@Injectable()
export class YoutubeAuthService {
    private oAuth2Client: OAuth2Client;

    private readonly youtubeScopes: string[];

    constructor(
        private readonly youtubeUserMapper: YoutubeUserMapper,
        @InjectRepository(YoutubeUserEntity) private readonly youtubeUserRepository: Repository<YoutubeUserEntity>,
    ) {
        this.oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URL,
        );

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

        return this.login(credentials.id_token!);
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

        if (!!userFound) {
            // TODO: update user
            return userFound;
        } else {
            const newUser = this.youtubeUserRepository.create(
                this.youtubeUserMapper.mapToEntity(youtubeUser),
            );
            return this.youtubeUserRepository.save(newUser);
        }
    }
}
