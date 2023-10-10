import { Injectable } from '@nestjs/common';
import { MusicData } from '../../../essentia/model/music-data.model';
import { FileInfo } from '../../../dao/youtube-downloader-python/model/file-info.model';
import { MusicDataAnalysisResult } from '../model/music-data-analysis-result.model';

@Injectable()
export class MusicDataMapper {

    toMusicDataAnalysisResult(musicData: MusicData, fileInfo: FileInfo): MusicDataAnalysisResult {
        return <MusicDataAnalysisResult>{
            videoId: fileInfo.id,
            trackName: fileInfo.track === 'NA' ? '' : fileInfo.track,
            artist: fileInfo.artist === 'NA' ? '' : fileInfo.artist,
            filePath: fileInfo.filePath,
            fileName: musicData.fileName,

            length: musicData.length,
            sampleRate: musicData.sampleRate,

            replayGain: musicData.replayGain,
            bpm: musicData.bpm,
            altBpm: musicData.altBpm,
            danceability: musicData.danceability,

            key: musicData.key,
            keyOpenNotation: musicData.keyOpenNotation,
            keyCamelot: musicData.keyCamelot,
        };
    }

}