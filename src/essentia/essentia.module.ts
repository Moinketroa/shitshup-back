import { Module } from '@nestjs/common';
import { EssentiaMusicDataMapper } from './mapper/essentia-music-data.mapper';
import { EssentiaService } from './essentia.service';
import { EssentiaRepositoryModule } from '../dao/essentia/essentia-repository.module';

@Module({
    imports: [
        EssentiaRepositoryModule,
    ],
    providers: [
        EssentiaService,
        EssentiaMusicDataMapper,
    ],
    exports: [
        EssentiaService,
    ]
})
export class EssentiaModule {

}