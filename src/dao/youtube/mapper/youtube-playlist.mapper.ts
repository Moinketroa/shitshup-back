import { Injectable } from '@nestjs/common';
import { YoutubePlaylist, YoutubeShitshupPlaylists } from '../entity/youtube-playlist.entity';
import { YoutubeClientPlaylist } from '../type/youtube-client.type';

@Injectable()
export class YoutubePlaylistMapper {

    mapToYoutubePlaylist(youtubeClientPlaylist: YoutubeClientPlaylist): YoutubePlaylist {
        return <YoutubePlaylist>{
            id: youtubeClientPlaylist.id,
            title: youtubeClientPlaylist.snippet?.title,
            description: youtubeClientPlaylist.snippet?.description,
            thumbnailUrl: youtubeClientPlaylist.snippet?.thumbnails?.default?.url,
        };
    }

    mapToYoutubeShitshupPlaylists(
        pendingPlaylist: YoutubeClientPlaylist,
    ): YoutubeShitshupPlaylists {
        return <YoutubeShitshupPlaylists>{
            pendingPlaylist: this.mapToYoutubePlaylist(pendingPlaylist),
        };
    }

}
