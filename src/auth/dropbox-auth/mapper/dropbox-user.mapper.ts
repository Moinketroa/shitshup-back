import { Injectable } from '@nestjs/common';
import { DropboxUserEntity } from '../../../dao/dropbox/entity/dropbox-user.entity';
import { UserEntity } from '../../../dao/user/entity/user.entity';
import { DropboxUser } from '../model/dropbox-user.model';
import { DropboxAccount } from '../../../dao/dropbox/type/dropbox-client.type';

@Injectable()
export class DropboxUserMapper {

    toEntityFromAccount(account: DropboxAccount, user: UserEntity, refreshToken: string, accessToken: string): DropboxUserEntity {
        return <DropboxUserEntity>{
            accountId: account.account_id,
            displayName: account.name.display_name,
            refreshToken: refreshToken,
            accessToken: accessToken,
            user: user,
        }
    }

    fromEntity(dropboxUserEntity: DropboxUserEntity): DropboxUser {
        return <DropboxUser>{
            id: dropboxUserEntity.id,
            accountId: dropboxUserEntity.accountId,
            displayName: dropboxUserEntity.displayName,
        };
    }

}