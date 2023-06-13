import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { YoutubeAuthService } from './youtube-auth.service';

@Injectable()
export class YoutubeAuthGuard implements CanActivate {
    constructor(private readonly youtubeAuthService: YoutubeAuthService) {}

    async canActivate(context: ExecutionContext) {
        const userFound = await this.youtubeAuthService.getCurrentUser();

        if (!userFound) {
            throw new UnauthorizedException();
        } else {
            return true;
        }
    }
}
