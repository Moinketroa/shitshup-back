import {
    ConnectedSocket,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../auth/guard/ws-auth.guard';
import { Server, Socket } from 'socket.io';
import { VerticalProcessNotificationService } from './vertical-process-notification.service';

@WebSocketGateway(83, {
    cors: true,
})
@UseGuards(WsAuthGuard)
export class VerticalProcessNotificationGateway {

    @WebSocketServer()
    server: Server;

    constructor(private readonly verticalProcessNotificationService: VerticalProcessNotificationService) {
    }

    @SubscribeMessage('vertical-process-notifications')
    handleEvent(@ConnectedSocket() client: Socket): Promise<void> {
        return this.verticalProcessNotificationService.registerClient(client);
    }
}