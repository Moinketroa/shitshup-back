export class MusicDataEntity {
    standard: MusicDataStandard;
    predictions: MusicDataPredictions;
}

export class MusicDataStandard {
    metadata: MusicDataMetaData;
    rhythm: MusicDataRhythm;
    tonal: MusicDataTonal;
}

export class MusicDataMetaData {
    audio_properties: MusicDataAudioProperties;
    tags: MusicDataTags;
}

export class MusicDataAudioProperties {
    length: number;
    replay_gain: number;
    sample_rate: number;
}

export class MusicDataTags {
    file_name: string;
}

export class MusicDataRhythm {
    bpm: number;
    danceability: number;
}

export class MusicDataTonal {
    key_edma: MusicDataKeyEstimation;
    key_krumhansl: MusicDataKeyEstimation;
    key_temperley: MusicDataKeyEstimation;
}

export class MusicDataKeyEstimation {
    strength: number;
    key: string;
    scale: string;
}

export class MusicDataPredictions {
    genre: MusicDataGenresPredictions;
    timbre: MusicDataTimbre;
    aggresive: {
        aggressive: number;
    };
    approachability: {
        approachable: number;
    };
    danceability: {
        danceable: number;
    };
    engagement: {
        engaging: number;
    };
    happy: {
        happy: number;
    };
    party: {
        party: number;
    };
    relaxed: {
        relaxed: number;
    };
    sad: {
        sad: number;
    };
}

export class MusicDataGenresPredictions {
    [genre: string]: number;
}

export class MusicDataTimbre {
    bright: number;
    dark: number;
}