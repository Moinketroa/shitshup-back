export class YoutubePlaylist {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
}

export class YoutubeShitshupPlaylists {
    pendingPlaylist: YoutubePlaylist;
    processedPlaylist: YoutubePlaylist;
    waitingPlaylist: YoutubePlaylist;
}
