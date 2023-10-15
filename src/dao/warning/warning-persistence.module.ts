import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarningEntity } from './entity/warning.entity';
import { WarningRepository } from './warning.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([WarningEntity]),
    ],
    providers: [
        WarningRepository,
    ],
    exports: [
        WarningRepository,
    ],
})
export class WarningPersistenceModule {

}