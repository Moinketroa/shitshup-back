import { Injectable } from '@nestjs/common';
import { YoutubePlaylistItemMapper } from './youtube-playlist-item.mapper';
import { YoutubeClientPlaylistItem, YoutubeClientPlaylistItemResponse } from '../type/youtube-client.type';
import { YoutubePlaylistPreview } from '../entity/youtube-playlist-preview.entity';

@Injectable()
export class YoutubePlaylistPreviewMapper {

    constructor(private readonly youtubePlaylistItemMapper: YoutubePlaylistItemMapper) {
    }

    map(id: string, playListItemResponse: YoutubeClientPlaylistItemResponse): YoutubePlaylistPreview {
        return <YoutubePlaylistPreview>{
            id,
            numberOfItems: playListItemResponse.pageInfo?.totalResults || 0,
            items: playListItemResponse.items?.map((playListItem: YoutubeClientPlaylistItem) => {
                return this.youtubePlaylistItemMapper.map(playListItem);
            }),
        };
    }

}