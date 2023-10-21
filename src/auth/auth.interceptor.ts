import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthRefresherJob } from './auth-refresher.job';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    constructor(private authRefresherJob: AuthRefresherJob) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        return next.handle().pipe(
            tap(() => {
                this.authRefresherJob.stopRefresherJob();
            }),
        );
    }
}
