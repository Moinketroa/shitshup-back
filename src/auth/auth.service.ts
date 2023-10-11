import { Injectable } from '@nestjs/common';
import { User } from './model/user.model';
import { JwtPayload } from './model/jwt-payload.model';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../dao/user/entity/user.entity';
import { isDefined } from '../util/util';
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
    ) {
    }

    async login(user: User) {
        const userFoundOrCreated = this.userMapper.mapFromEntity(await this.findOrCreateUser(user));

        const payload: JwtPayload = {
            username: userFoundOrCreated.email,
            sub: userFoundOrCreated.id!,
        };

        return this.jwtService.sign(payload);
    }

    async validate(id: string) {
        const userFound = this.userMapper.mapFromEntity((await this.findUser(id))!);

        this.oAuth2Client.setCredentials({
            refresh_token: userFound.googleRefreshToken,
            access_token: userFound.googleAccessToken,
        });

        return this.youtubeAuthService.getCurrentUser();
    }

    private async findOrCreateUser(user: User): Promise<UserEntity> {
        const userFound = await this.userRepository.findOneBy({
            id: user.id,
        });

        if (isDefined(userFound)) {
            // TODO: update user
            return userFound;
        } else {
            const newUser = this.userRepository.create(
                this.userMapper.mapToEntity(user),
            );
            return this.userRepository.save(newUser);
        }
    }

    private findUser(id: string): Promise<UserEntity | null> {
        return this.userRepository.findOneBy({
            id: id,
        });
    }
}