import { Injectable } from '@nestjs/common';
import { EssentiaMusicDataMapper } from './mapper/essentia-music-data.mapper';
import { map, Observable } from 'rxjs';
import { MusicData } from './model/music-data.model';
import { EssentiaHttpRepository } from '../dao/essentia/essentia-http.repository';
import { MusicDataEntity } from '../dao/essentia/entity/music-data.entity';

@Injectable()
export class EssentiaService {

    constructor(private readonly essentiaMusicDataMapper: EssentiaMusicDataMapper,
                private readonly essentiaHttpService: EssentiaHttpRepository) {
    }

    getMusicData(filePath: string, userId: string): Observable<MusicData> {
        return this.essentiaHttpService.fetchMusicData(filePath, userId)
            .pipe(
                map((musicDataEntity: MusicDataEntity) => {
                    return this.essentiaMusicDataMapper.mapFromEntity(musicDataEntity);
                })
            )
    }
}