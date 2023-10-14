import {
    ConnectedSocket,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TaskNotificationService } from './task-notification.service';
import { WsAuthGuard } from '../../auth/guard/ws-auth.guard';

@WebSocketGateway(81, {
    cors: true,
})
@UseGuards(WsAuthGuard)
export class TaskNotificationGateway {

    @WebSocketServer()
    server: Server;

    constructor(private readonly taskNotificationService: TaskNotificationService) {
    }

    @SubscribeMessage('tasks-notifications')
    handleEvent(@ConnectedSocket() client: Socket): Promise<void> {
        return this.taskNotificationService.registerClient(client);
    }


}