import { Module, Scope } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserMapper } from './mapper/user.mapper';
import { AuthService } from './auth.service';
import { OAuth2ClientModule } from './o-auth-2-client.module';
import { YoutubeAuthModule } from './youtube-auth/youtube-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../dao/user/entity/user.entity';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guard/auth.guard';
import { YoutubeUserEntity } from '../dao/youtube/entity/youtube-user.entity';
import { WsAuthService } from './ws-auth.service';
import { WsAuthGuard } from './guard/ws-auth.guard';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthInterceptor } from './auth.interceptor';
import { AuthRefresherJob } from './auth-refresher.job';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            global: true,
            secret: 'your-secret-key', // Replace with your actual secret key
            signOptions: { expiresIn: '1d' }, // Set token expiration as needed
        }),

        OAuth2ClientModule,
        TypeOrmModule.forFeature([UserEntity, YoutubeUserEntity]),
        YoutubeAuthModule,
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        JwtStrategy,
        UserMapper,
        AuthService,
        AuthGuard,

        WsAuthService,
        WsAuthGuard,

        {
            provide: APP_INTERCEPTOR,
            useClass: AuthInterceptor,
            scope: Scope.REQUEST,
        },

        AuthRefresherJob,
    ],
    exports: [
        JwtStrategy,
        PassportModule,
        AuthService,
        WsAuthService,
    ],
})
export class AuthModule {
}
