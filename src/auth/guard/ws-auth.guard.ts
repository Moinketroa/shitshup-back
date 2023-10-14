import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { isNullOrUndefined } from '../../util/util';
import { isArray } from 'lodash';
import { WsAuthService } from '../ws-auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {

    constructor(private jwtService: JwtService,
                private readonly wsAuthService:  WsAuthService,) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();
        const token = this.extractTokenFromSocket(client);
        if (!token) {
            throw new WsException('Unauthorized');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: 'your-secret-key', // Replace with your actual secret key
            });

            const userFound = await this.wsAuthService.validate(payload);

            if (isNullOrUndefined(userFound)) {
                throw new WsException('Unauthorized');
            } else {
                client.data.user = userFound;

                return true;
            }
        } catch {
            throw new WsException('Unauthorized');
        }
    }

    private extractTokenFromSocket(client: Socket): string | undefined {
        const tokenQueryParam = client.handshake.query.token;

        if (isNullOrUndefined(tokenQueryParam) || isArray(tokenQueryParam)) {
            return undefined;
        }

        const fullToken: string = tokenQueryParam as string;
        const [ type, token ] = fullToken.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}