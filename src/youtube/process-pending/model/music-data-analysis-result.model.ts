export class MusicDataAnalysisResult {
    videoId: string;
    trackName: string;
    artist: string;
    filePath: string;
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
}