import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { isNullOrUndefined } from '../../util/util';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt.strategy';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private jwtStrategy: JwtStrategy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: 'your-secret-key', // Replace with your actual secret key
            });

            const userFound = await this.jwtStrategy.validate(payload);

            if (isNullOrUndefined(userFound)) {
                throw new UnauthorizedException();
            } else {
                request.youtubeUser = userFound;

                return true;
            }
        } catch {
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [ type, token ] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
