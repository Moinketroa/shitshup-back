import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';
import { isNullOrUndefined } from '../util/util';

@Injectable()
export class YoutubeAuthGuard implements CanActivate {
    constructor(private readonly youtubeAuthService: YoutubeAuthService) {}

    async canActivate(context: ExecutionContext) {
        const userFound = await this.youtubeAuthService.getCurrentUser();

        if (isNullOrUndefined(userFound)) {
            throw new UnauthorizedException();
        } else {
            const request = context.switchToHttp().getRequest();

            request.youtubeUser = userFound;

            return true;
        }
    }
}
