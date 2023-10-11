import { Injectable } from '@nestjs/common';
import { YoutubeUser } from '../../../auth/youtube-auth/model/youtube-user.model';
import { YoutubeUserEntity } from '../entity/youtube-user.entity';

@Injectable()
export class YoutubeUserMapper {
    mapToEntity(youtubeUser: YoutubeUser): YoutubeUserEntity {
        return <YoutubeUserEntity>{
            id: youtubeUser.id,
            googleId: youtubeUser.googleId,
            lastName: youtubeUser.lastName,
            firstName: youtubeUser.firstName,
            email: youtubeUser.email,
            photoUrl: youtubeUser.photoUrl,
        };
    }

    mapFromEntity(youtubeUserEntity: YoutubeUserEntity): YoutubeUser {
        return <YoutubeUser>{
            id: youtubeUserEntity.id,
            googleId: youtubeUserEntity.googleId,
            lastName: youtubeUserEntity.lastName,
            firstName: youtubeUserEntity.firstName,
            email: youtubeUserEntity.email,
            photoUrl: youtubeUserEntity.photoUrl,
            displayName: this.buildDisplayName(youtubeUserEntity),
            pendingPlaylistId: youtubeUserEntity.pendingPlaylistId,
            processedPlaylistId: youtubeUserEntity.processedPlaylistId,
            waitingPlaylistId: youtubeUserEntity.waitingPlaylistId,
        };
    }

    private buildDisplayName(youtubeUserEntity: YoutubeUserEntity): string {
        return (youtubeUserEntity.firstName + ' ' + youtubeUserEntity.lastName).trim();
    }
}
