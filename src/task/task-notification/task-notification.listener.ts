import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { TaskNotificationSender } from './task-notification.sender';

@Injectable()
export class TaskNotificationListener implements OnModuleInit {

    constructor(private readonly pgClient: Client,
                private readonly taskNotificationSender: TaskNotificationSender) {
    }

    onModuleInit(): any {
        this.setupListener().then(r => {});
    }

    private async setupListener() {
        await this.pgClient.connect();

        this.pgClient.on('notification', async (message) => {
            await this.taskNotificationSender.sendTaskNotification(message.payload!);
        });

        await this.pgClient.query('LISTEN tasks_changes');
    }
}