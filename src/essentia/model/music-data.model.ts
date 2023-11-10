import { MusicDataCategory } from './music-data-category.enum';

export class MusicData {
    length: string;
    sampleRate: number;

    replayGain: number;

    bpm: number;
    altBpm: number;
    danceability: number;

    key: string;
    keyOpenNotation: string;
    keyCamelot: string;

    genres: string[];
    altGenres: string[];
    timbre: number;
    categories: MusicDataCategory[];
}

export class NullMusicData extends MusicData {
    fileName = "";
    length = "";
    sampleRate = 0;

    replayGain = 0;

    bpm = 0;
    altBpm = 0;
    danceability = 0;

    key = '';
    keyOpenNotation = '';
    keyCamelot = '';

    genres = [];
    altGenres = [];
    timbre = 0;
    categories = [];
}