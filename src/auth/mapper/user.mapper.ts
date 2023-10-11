import { Injectable } from '@nestjs/common';
import { User } from '../model/user.model';
import { UserEntity } from '../../dao/user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { YoutubeUserEntity } from '../../dao/youtube/entity/youtube-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserMapper {

    constructor(@InjectRepository(YoutubeUserEntity) private readonly youtubeUserRepository: Repository<YoutubeUserEntity>) {
    }

    async mapToEntity(user: User): Promise<UserEntity> {
        return <UserEntity>{
            id: user.id,
            email: user.email,
            googleAccessToken: user.googleAccessToken,
            googleRefreshToken: user.googleRefreshToken,
            youtubeUser: await this.youtubeUserRepository.findOneBy({ id: user.youtubeUserId }),
        }
    }

    mapFromEntity(userEntity: UserEntity): User {
        return <User>{
            id: userEntity.id,
            email: userEntity.email,
            googleAccessToken: userEntity.googleAccessToken,
            googleRefreshToken: userEntity.googleRefreshToken,
            youtubeUserId: userEntity.youtubeUser.id,
        }
    }

}