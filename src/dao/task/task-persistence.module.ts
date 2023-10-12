import { Module } from '@nestjs/common';
import { TaskEntity } from './entity/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([TaskEntity]),
    ],
    providers: [
        TaskRepository,
    ],
    exports: [
        TaskRepository,
    ]
})
export class TaskPersistenceModule {

}