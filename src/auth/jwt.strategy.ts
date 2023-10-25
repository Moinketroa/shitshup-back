import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './model/jwt-payload.model';
import { UserMapper } from './mapper/user.mapper';
import { AuthService } from './auth.service';
import * as process from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    private readonly JWT_SECRET: string;

    constructor(
        private readonly userMapper: UserMapper,
        private readonly authService: AuthService,
    ) {
        const jwtSecret = process.env.JWT_SECRET || '';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        });

        this.JWT_SECRET = jwtSecret;
    }

    async validate(payload: JwtPayload) {
        return this.authService.validate(payload.sub);
    }
}
