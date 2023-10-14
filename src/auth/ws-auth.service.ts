import { Injectable } from '@nestjs/common';
import { JwtPayload } from './model/jwt-payload.model';
import { UserMapper } from './mapper/user.mapper';
import { User } from './model/user.model';
import { UserEntity } from '../dao/user/entity/user.entity';
import { isDefined } from '../util/util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WsAuthService {

    constructor(private readonly userMapper: UserMapper,
                @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,) {
    }

    async validate(payload: JwtPayload): Promise<User> {
        const userId = payload.sub;

        return this.userMapper.mapFromEntity((await this.findUser(userId))!);
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