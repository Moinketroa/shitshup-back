import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './model/jwt-payload.model';
import { UserMapper } from './mapper/user.mapper';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your-secret-key', // Replace with your actual secret key
        });
    }

    async validate(payload: JwtPayload) {
        return this.authService.validate(payload.sub);
    }
}
