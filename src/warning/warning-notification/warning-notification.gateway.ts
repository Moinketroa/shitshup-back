import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../auth/guard/ws-auth.guard';
import { Server, Socket } from 'socket.io';
import { WarningNotificationService } from './warning-notification.service';

@WebSocketGateway(82, {
    cors: true,
})
@UseGuards(WsAuthGuard)
export class WarningNotificationGateway {

    @WebSocketServer()
    server: Server;

    constructor(private readonly warningNotificationService: WarningNotificationService) {
    }

    @SubscribeMessage('warnings-notifications')
    handleEvent(@ConnectedSocket() client: Socket): Promise<void> {
        return this.warningNotificationService.registerClient(client);
    }


}