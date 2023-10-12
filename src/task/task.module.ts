import { Module } from '@nestjs/common';
import { TaskPersistenceModule } from '../dao/task/task-persistence.module';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../dao/task/entity/task.entity';
import { TaskMapper } from './mapper/task.mapper';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        TaskPersistenceModule,
    ],
    providers: [
        TaskMapper,
        TaskService,
    ],
    exports: [
        TaskService,
    ],
})
export class TaskModule {
    
}