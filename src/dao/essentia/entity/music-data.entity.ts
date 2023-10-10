export class MusicDataEntity {
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
