import { Injectable } from '@nestjs/common';
import { MusicDataEntity, MusicDataKeyEstimation } from '../../dao/essentia/entity/music-data.entity';
import { MusicData } from '../model/music-data.model';
import * as lodash from 'lodash';
import { convertRange, formatDurationFromSeconds, roundTwoDecimal } from '../../util/util';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const camelotWheel = require('../../../deps/regorxxx/Camelot-Wheel-Notation:2.0.1/camelot_wheel_xxx.js');

@Injectable()
export class EssentiaMusicDataMapper {

    private readonly MINUTES_COLON_SECONDS_FORMAT: string = 'mm:ss';
    private readonly ESSENTIA_DANCEABILITY_RANGE: [number, number] = [ 0, 3 ];
    private readonly NORMAL_PEOPLE_DANCEABILITY_RANGE: [number, number] = [ 0, 10 ];

    mapFromEntity(musicDataEntity: MusicDataEntity): MusicData {
        const mostConfidentKeyEstimation: MusicDataKeyEstimation = this.getMostConfidentEstimation(
            musicDataEntity.tonal.key_edma,
            musicDataEntity.tonal.key_krumhansl,
            musicDataEntity.tonal.key_temperley,
        );

        return <MusicData>{
            fileName: musicDataEntity.metadata.tags.file_name,

            length: formatDurationFromSeconds(
                musicDataEntity.metadata.audio_properties.length,
                this.MINUTES_COLON_SECONDS_FORMAT,
            ),
            replayGain: musicDataEntity.metadata.audio_properties.replay_gain,
            sampleRate: musicDataEntity.metadata.audio_properties.sample_rate,

            bpm: roundTwoDecimal(musicDataEntity.rhythm.bpm),
            altBpm: this.getAlternateBPM(musicDataEntity.rhythm.bpm),

            danceability: this.getFormattedDanceability(musicDataEntity.rhythm.danceability),

            key: this.getFormattedKey(mostConfidentKeyEstimation),
            keyOpenNotation: this.convertKeyToOpenKeyNotation(mostConfidentKeyEstimation),
            keyCamelot: this.convertKeyToCamelotNotation(mostConfidentKeyEstimation),
        };
    }

    private getAlternateBPM(bpm: number): number {
        const altBpm = bpm >= 120
            ? bpm / 2
            : bpm * 2;

        return roundTwoDecimal(altBpm);
    }

    private getFormattedDanceability(rawValue: number): number {
        return convertRange(rawValue, this.ESSENTIA_DANCEABILITY_RANGE, this.NORMAL_PEOPLE_DANCEABILITY_RANGE);
    }

    private getMostConfidentEstimation(...estimations: MusicDataKeyEstimation[]): MusicDataKeyEstimation {
        return lodash.maxBy(estimations, 'strength')!;
    }

    private getFormattedKey(keyEstimation: MusicDataKeyEstimation): string {
        return `${keyEstimation.key} ${keyEstimation.scale}`;
    }

    private convertKeyToOpenKeyNotation(keyEstimation: MusicDataKeyEstimation): string {
        const basicKeyNotation = this.getBasicKeyNotation(keyEstimation);

        const openKeyNotation = camelotWheel.getKeyNotationObjectOpen(basicKeyNotation);

        return `${openKeyNotation.hour}${openKeyNotation.letter}`;
    }

    private convertKeyToCamelotNotation(keyEstimation: MusicDataKeyEstimation): string {
        const basicKeyNotation = this.getBasicKeyNotation(keyEstimation);

        const openKeyNotation = camelotWheel.getKeyNotationObjectCamelot(basicKeyNotation);

        return `${openKeyNotation.letter}${openKeyNotation.hour}`;
    }

    private getBasicKeyNotation(keyEstimation: MusicDataKeyEstimation): string {
        const key: string = keyEstimation.key;
        const scale: string = keyEstimation.scale === 'minor'
            ? 'm'
            : '';

        return `${key}${scale}`;
    }
}