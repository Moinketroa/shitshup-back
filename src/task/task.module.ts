import { Module } from '@nestjs/common';
import { TaskPersistenceModule } from '../dao/task/task-persistence.module';
import { TaskService } from './task.service';
import { TaskMapper } from './mapper/task.mapper';
import { AuthModule } from '../auth/auth.module';
import { TaskController } from './task.controller';

@Module({
    imports: [
        AuthModule.forRoot(),
        TaskPersistenceModule,
    ],
    controllers: [
        TaskController,
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