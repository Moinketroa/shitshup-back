import { Injectable } from '@nestjs/common';
import { YoutubeClientPlaylistItem } from '../type/youtube-client.type';
import { YoutubePlaylistItem } from '../entity/youtube-playlist-item.entity';

@Injectable()
export class YoutubePlaylistItemMapper {

    map(playlistItem: YoutubeClientPlaylistItem): YoutubePlaylistItem {
        return <YoutubePlaylistItem>{
            id: playlistItem.id,
            videoId: playlistItem.snippet?.resourceId?.videoId,
            title: playlistItem.snippet?.title,
            thumbnailUrl: playlistItem.snippet?.thumbnails?.default?.url,
        };
    }

}