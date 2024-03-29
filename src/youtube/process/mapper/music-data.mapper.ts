import { Injectable } from '@nestjs/common';
import { MusicData } from '../../../essentia/model/music-data.model';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { MusicDataAnalysisResult } from '../model/music-data-analysis-result.model';
import * as path from 'path';

@Injectable()
export class MusicDataMapper {

    toMusicDataAnalysisResult(musicData: MusicData, fileInfo: FileInfo): MusicDataAnalysisResult {
        const fileName = path.basename(fileInfo.filePath);

        return <MusicDataAnalysisResult>{
            videoId: fileInfo.id,
            trackName: fileInfo.track === 'NA'
                ? this.removeFileExtension(fileName)
                : fileInfo.track,
            artist: fileInfo.artist === 'NA'
                ? ''
                : fileInfo.artist,
            filePath: fileInfo.filePath,
            fileName: fileName,

            length: musicData.length,
            sampleRate: musicData.sampleRate,

            replayGain: musicData.replayGain,
            bpm: musicData.bpm,
            altBpm: musicData.altBpm,
            danceability: musicData.danceability,

            key: musicData.key,
            keyOpenNotation: musicData.keyOpenNotation,
            keyCamelot: musicData.keyCamelot,

            genres: musicData.genres,
            altGenres: musicData.altGenres,
            timbre: musicData.timbre,
            categories: musicData.categories,
        };
    }

    private removeFileExtension(filename: string): string {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return filename;
        } else {
            return filename.substring(0, lastDotIndex);
        }
    }

}