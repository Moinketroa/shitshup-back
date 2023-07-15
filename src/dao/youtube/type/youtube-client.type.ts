import { youtube_v3 } from 'googleapis';

export type YoutubeClientPlaylistResponse = youtube_v3.Schema$PlaylistListResponse;

export type YoutubeClientPlaylist = youtube_v3.Schema$Playlist;

export type YoutubeClientPlaylistItemResponse = youtube_v3.Schema$PlaylistItemListResponse;

export type YoutubeClientPlaylistItem = youtube_v3.Schema$PlaylistItem;

export class YoutubeClient extends youtube_v3.Youtube {}
