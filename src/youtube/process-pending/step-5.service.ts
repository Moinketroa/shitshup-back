import { Injectable } from '@nestjs/common';
import { FileInfo } from '../../dao/youtube-downloader-python/model/file-info.model';
import { EssentiaService } from '../../essentia/essentia.service';
import { firstValueFrom, map } from 'rxjs';
import { MusicDataMapper } from './mapper/music-data.mapper';
import { MusicDataAnalysisResult } from './model/music-data-analysis-result.model';

@Injectable()
export class Step5Service {

    constructor(private readonly essentiaService: EssentiaService,
                private readonly musicDataMapper: MusicDataMapper,) {
    }

    stepGetMusicInfos(fileInfos: FileInfo[]): Promise<MusicDataAnalysisResult[]> {
        const $musicDataAnalysisResults = fileInfos.map(fileInfo => {
            return this.essentiaService.getMusicData(fileInfo.filePath)
                .pipe(
                    map(musicData => (
                        this.musicDataMapper.toMusicDataAnalysisResult(musicData, fileInfo)
                    ))
                )
        })

        console.log('[PROCESS_PENDING][STEP 5] Query Python Server for music data...');
        return Promise.all($musicDataAnalysisResults.map(obs => firstValueFrom(obs)));
    }

}