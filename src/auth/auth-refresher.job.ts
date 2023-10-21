import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { CronJob } from 'cron';
import { AuthService } from './auth.service';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../dao/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AuthRefresherJob {

    private refresherJob: CronJob;

    constructor(@Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
                private readonly oAuth2Client: OAuth2Client,
                @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,) {
    }

    startRefresherJob() {
        this.refresherJob = new CronJob({
            cronTime: '* 10 * * * *',
            start: true,
            onTick: () => {
                this.updateTokens().then();
            },
        });
    }

    stopRefresherJob() {
        if (this.refresherJob && this.refresherJob.running) {
            this.refresherJob.stop();
        }
    }

    async updateTokens() {
        const currentUser = await this.authService.getCurrentUser();
        const response = await this.oAuth2Client.refreshAccessToken();
        const credentials = response.credentials;

        await this.userRepository.update(currentUser?.id!, {
            googleAccessToken: credentials.access_token!,
            googleRefreshToken: credentials.refresh_token!
        })
    }
}