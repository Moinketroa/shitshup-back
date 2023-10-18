import { Injectable } from '@nestjs/common';
import { User } from './model/user.model';
import { JwtPayload } from './model/jwt-payload.model';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../dao/user/entity/user.entity';
import { isDefined, isNullOrUndefined } from '../util/util';
import { UserMapper } from './mapper/user.mapper';
import { OAuth2Client } from 'google-auth-library';
import { YoutubeAuthService } from './youtube-auth/youtube-auth.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly oAuth2Client: OAuth2Client,
        private readonly youtubeAuthService: YoutubeAuthService,
        private readonly jwtService: JwtService,
        private readonly userMapper: UserMapper,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) {}

    async login(user: User) {
        const userFoundOrCreated = this.userMapper.mapFromEntity(await this.findAndUpdateOrCreateUser(user));

        const payload: JwtPayload = {
            username: userFoundOrCreated.email,
            sub: userFoundOrCreated.id!,
        };

        return this.jwtService.sign(payload);
    }

    async validate(id: string) {
        const userFound = await this.findUser(id);

        await this.refreshAccessToken(userFound!);

        return this.youtubeAuthService.getCurrentUser();
    }

    async getCurrentUser(): Promise<UserEntity | null> {
        const currentYoutubeUser = await this.youtubeAuthService.getCurrentUser();
        const currentYoutubeUserEntity = await this.youtubeAuthService.findYoutubeUser(currentYoutubeUser?.id);

        return this.findUser(currentYoutubeUserEntity?.user?.id);
    }

    private async refreshAccessToken(user: UserEntity): Promise<any> {
        this.oAuth2Client.setCredentials({
            refresh_token: user.googleRefreshToken,
        });

        const accessTokenResponse = await this.oAuth2Client.getAccessToken();
        const newAccessToken = accessTokenResponse.token;

        const updatedUserEntity = <UserEntity>{
            ...user,
            googleAccessToken: newAccessToken!,
        };
        await this.userRepository.update(updatedUserEntity.id, updatedUserEntity);
    }

    private async findAndUpdateOrCreateUser(user: User): Promise<UserEntity> {
        let userId = user.id;

        if (isNullOrUndefined(userId)) {
            const youtubeUserFound = await this.youtubeAuthService.findYoutubeUser(user.youtubeUserId);

            userId = youtubeUserFound?.user?.id;
        }

        const userFound = await this.findUser(userId!);

        if (isDefined(userFound)) {
            const updatedUserEntity = await this.userMapper.mapToEntity({
                id: userId,
                ...user,
            });
            await this.userRepository.update(updatedUserEntity.id, updatedUserEntity);

            return updatedUserEntity;
        } else {
            const newUser = this.userRepository.create(await this.userMapper.mapToEntity(user));

            return this.userRepository.save(newUser);
        }
    }

    private async findUser(id: string | undefined): Promise<UserEntity | null> {
        return isDefined(id)
            ? this.userRepository.findOne({
                  where: {
                      id: id,
                  },
                  relations: {
                      youtubeUser: true,
                  },
              })
            : null;
    }


}
