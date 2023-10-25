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
import * as process from 'process';

@Injectable()
export class AuthGuard implements CanActivate {

    private readonly JWT_SECRET: string;

    constructor(private jwtService: JwtService, private jwtStrategy: JwtStrategy) {
        this.JWT_SECRET = process.env.JWT_SECRET || '';
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.JWT_SECRET,
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
