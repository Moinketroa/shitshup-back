import { AbstractProcessStepEntity } from './entity/abstract-process-step.entity';
import { Repository } from 'typeorm';
import { ProcessTrackEntity } from './entity/process-track.entity';

export abstract class AbstractProcessStepRepository<T extends AbstractProcessStepEntity> extends Repository<T> {
    protected constructor(repository: Repository<T>) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    createOne(rootProcessTrack: ProcessTrackEntity): Promise<T> {
        return this.save(<T>{
            hasCompleted: false,
            hasFailed: false,
            rootProcessTrack: rootProcessTrack,
        });
    }

    async complete(processStep: T): Promise<void> {
        await this.update(
            processStep.id,
            {
                // @ts-ignore
                hasCompleted: true,
            },
        )
    }

    async fail(processStep: T, errorMessage: string): Promise<void> {
        await this.update(
            processStep.id,
            {
                // @ts-ignore
                hasFailed: true,
                errorMessage: errorMessage,
            },
        );
    }

}