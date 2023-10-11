import { Injectable } from '@nestjs/common';
import { User } from '../model/user.model';
import { UserEntity } from '../../dao/user/entity/user.entity';

@Injectable()
export class UserMapper {

    mapToEntity(user: User): UserEntity {
        return <UserEntity>{
            id: user.id,
            email: user.email,
            googleAccessToken: user.googleAccessToken,
            googleRefreshToken: user.googleRefreshToken,
            jwtToken: user.jwtToken,
        }
    }

    mapFromEntity(userEntity: UserEntity): User {
        return <User>{
            id: userEntity.id,
            email: userEntity.email,
            googleAccessToken: userEntity.googleAccessToken,
            googleRefreshToken: userEntity.googleRefreshToken,
            jwtToken: userEntity.jwtToken,
        }
    }

}