import { Injectable } from '@nestjs/common';
import {
    MusicDataEntity,
    MusicDataGenresPredictions,
    MusicDataKeyEstimation,
    MusicDataPredictions,
    MusicDataTimbre,
} from '../../dao/essentia/entity/music-data.entity';
import { MusicData, NullMusicData } from '../model/music-data.model';
import * as lodash from 'lodash';
import { isArray } from 'lodash';
import { convertRange, formatDurationFromSeconds, isDefined, roundTwoDecimal } from '../../util/util';
import { MusicDataCategory } from '../model/music-data-category.enum';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const camelotWheel = require('../../../deps/regorxxx/Camelot-Wheel-Notation:2.0.1/camelot_wheel_xxx.js');

class MusicDataGenres {
    genres: string[];
    altGenres: string[];
}

class MusicDataGenre {
    genre: string;
    weight: number;
}

@Injectable()
export class EssentiaMusicDataMapper {

    private readonly MINUTES_COLON_SECONDS_FORMAT: string = 'mm:ss';
    private readonly ESSENTIA_DANCEABILITY_RANGE: [number, number] = [ 0, 3 ];
    private readonly NORMAL_PEOPLE_DANCEABILITY_RANGE: [number, number] = [ 0, 10 ];

    mapFromEntity(musicDataEntity: MusicDataEntity): MusicData {
        if (this.isEmptyMusicDataEntity(musicDataEntity)) {
            return new NullMusicData();
        }

        const mostConfidentKeyEstimation: MusicDataKeyEstimation = this.getMostConfidentEstimation(
            musicDataEntity.standard.tonal.key_edma,
            musicDataEntity.standard.tonal.key_krumhansl,
            musicDataEntity.standard.tonal.key_temperley,
        );

        const { genres, altGenres } = this.calculateGenres(musicDataEntity.predictions.genre);

        return <MusicData>{
            length: formatDurationFromSeconds(
                musicDataEntity.standard.metadata.audio_properties.length,
                this.MINUTES_COLON_SECONDS_FORMAT,
            ),
            replayGain: musicDataEntity.standard.metadata.audio_properties.replay_gain,
            sampleRate: musicDataEntity.standard.metadata.audio_properties.sample_rate,

            bpm: roundTwoDecimal(musicDataEntity.standard.rhythm.bpm),
            altBpm: this.getAlternateBPM(musicDataEntity.standard.rhythm.bpm),

            danceability: this.getFormattedDanceability(musicDataEntity.standard.rhythm.danceability),

            key: this.getFormattedKey(mostConfidentKeyEstimation),
            keyOpenNotation: this.convertKeyToOpenKeyNotation(mostConfidentKeyEstimation),
            keyCamelot: this.convertKeyToCamelotNotation(mostConfidentKeyEstimation),

            genres: genres,
            altGenres: altGenres,
            timbre: this.mapTimbre(musicDataEntity.predictions.timbre),
            categories: this.calculateCategories(musicDataEntity.predictions),
        };
    }

    private isEmptyMusicDataEntity(musicDataEntity: any): boolean {
        return !!isDefined(musicDataEntity.error);
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

    private calculateGenres(genrePredictions: MusicDataGenresPredictions): MusicDataGenres {
        const genresPossible = Object.keys(genrePredictions).map(genre => ({
            genre: genre,
            weight: genrePredictions[genre] * 100,
        }));

        genresPossible.sort((a, b) => a.weight - b.weight);

        const mostLikelyGenre = genresPossible[0];

        if (mostLikelyGenre.weight >= 75) {
            return this.computeGenresWithPredominantGenre(mostLikelyGenre, genresPossible);
        } else if (mostLikelyGenre.weight >= 25) {
            return this.computeGenresWithMoreThanOneGenre(genresPossible)
        } else {
            return this.computeGenresWithUncertainGenre(genresPossible);
        }
    }

    private computeGenresWithPredominantGenre(mostLikelyGenre: MusicDataGenre, allGenresPossible: MusicDataGenre[]): MusicDataGenres {
        const altGenres: string[] = allGenresPossible
            .filter(genre => {
                return genre.weight >= 5 && genre.weight < 75
            })
            .map(genre => genre.genre);

        const finalAltGenres = lodash.take(altGenres, 2);

        return this.createMusicDataGenres(mostLikelyGenre.genre, finalAltGenres);
    }

    private computeGenresWithMoreThanOneGenre(allGenresPossible: MusicDataGenre[]): MusicDataGenres {
        const relevantGenres: string[] = allGenresPossible
            .filter(genre => {
                return genre.weight >= 5 && genre.weight < 75
            })
            .map(genre => genre.genre);

        const finalMainGenres = lodash.take(relevantGenres, 2);
        const finalAltGenres = lodash.take(lodash.without(relevantGenres, ...finalMainGenres), 2);

        return this.createMusicDataGenres(finalMainGenres, finalAltGenres);
    }

    private computeGenresWithUncertainGenre(allGenresPossible: MusicDataGenre[]): MusicDataGenres {
        const relevantGenres: string[] = allGenresPossible
            .filter(genre => {
                return genre.weight >= 5 && genre.weight < 25
            })
            .map(genre => genre.genre);

        const finalMainGenres = lodash.take(relevantGenres, 3);
        const finalAltGenres = lodash.take(lodash.without(relevantGenres, ...finalMainGenres), 3);

        return this.createMusicDataGenres(finalMainGenres, finalAltGenres);
    }

    private createMusicDataGenres(genres: string | string[], altGenres: string | string[]): MusicDataGenres {
        const finalGenres = isArray(genres)
            ? genres
            : [ genres ];
        const finalAtlGenres = isArray(altGenres)
            ? altGenres
            : [ altGenres ];

        return { genres: finalGenres, altGenres: finalAtlGenres };
    }

    private mapTimbre(timbre: MusicDataTimbre): number {
        return roundTwoDecimal(timbre.bright * 100);
    }

    private calculateCategories(predictions: MusicDataPredictions): MusicDataCategory[] {
        const categories: MusicDataCategory[] = [];

        if (predictions.approachability.approachable >= 0.75)
            categories.push(MusicDataCategory.MAINSTREAM);
        if (predictions.approachability.approachable <= 0.25)
            categories.push(MusicDataCategory.EXPERIMENTAL);
        if (predictions.engagement.engaging <= 0.25)
            categories.push(MusicDataCategory.BACKGROUND);
        if (predictions.danceability.danceable >= 0.75)
            categories.push(MusicDataCategory.DANCEABLE);
        if (predictions.aggresive.aggressive >= 0.75)
            categories.push(MusicDataCategory.AGGRESSIVE);
        if (predictions.happy.happy >= 0.75)
            categories.push(MusicDataCategory.HAPPY);
        if (predictions.party.party >= 0.75)
            categories.push(MusicDataCategory.PARTY);
        if (predictions.relaxed.relaxed >= 0.75)
            categories.push(MusicDataCategory.RELAXED);
        if (predictions.sad.sad >= 0.75)
            categories.push(MusicDataCategory.SAD);

        return categories;
    }
}