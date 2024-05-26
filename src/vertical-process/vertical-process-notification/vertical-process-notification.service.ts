import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../../auth/model/user.model';

@Injectable()
export class VerticalProcessNotificationService {

    async registerClient(client: Socket) {
        const currentUser: User = client.data.user as User;
        client.join(currentUser.id!);
    }

}