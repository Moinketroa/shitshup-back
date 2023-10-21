import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { DropboxAuthService } from '../dropbox-auth.service';

@Injectable()
export class DropboxAuthGuard implements CanActivate {
    constructor(private readonly dropboxAuthService: DropboxAuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            return this.dropboxAuthService.validate();
        } catch {
            throw new UnauthorizedException();
        }
    }
}
