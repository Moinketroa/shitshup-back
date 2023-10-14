import { MusicDataCategory } from './music-data-category.enum';

export class MusicData {
    fileName: string;
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
