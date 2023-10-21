import { Injectable, Scope } from '@nestjs/common';
import { DropboxAuth } from 'dropbox';
import { CronJob } from 'cron';
import { isDefined } from '../../util/util';
import { AuthService } from '../auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DropboxUserEntity } from '../../dao/dropbox/entity/dropbox-user.entity';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class DropboxRefresherJob {

    private refresherJob: CronJob;

    constructor(private readonly dropboxAuth: DropboxAuth,
                private readonly authService: AuthService,
                @InjectRepository(DropboxUserEntity) private readonly dropboxUserRepository: Repository<DropboxUserEntity>) {
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
        const currentDropboxUser = currentUser?.dropboxUser;
        const dropboxUserId = currentDropboxUser?.id;

        this.dropboxAuth.refreshAccessToken();

        if (isDefined(dropboxUserId)) {
            await this.dropboxUserRepository.update(dropboxUserId, {
                accessToken: this.dropboxAuth.getAccessToken(),
                refreshToken: this.dropboxAuth.getRefreshToken(),
            });
        }

    }
}