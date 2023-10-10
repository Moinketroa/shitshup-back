import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EssentiaHttpRepository } from './essentia-http.repository';

@Module({
    imports: [
        HttpModule,
    ],
    providers: [
        EssentiaHttpRepository,
    ],
    exports: [
        EssentiaHttpRepository,
    ]
})
export class EssentiaRepositoryModule {

}