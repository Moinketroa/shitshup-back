import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DropboxRefresherJob } from './dropbox-refresher.job';

@Injectable()
export class DropboxAuthInterceptor implements NestInterceptor {
    constructor(private dropboxRefresherJob: DropboxRefresherJob) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        return next.handle().pipe(
            tap(() => {
                this.dropboxRefresherJob.stopRefresherJob();
            }),
        );
    }
}
