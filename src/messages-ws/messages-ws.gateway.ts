import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { MessageFromClientDto } from './dtos/client-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() wss: Server;

    constructor(
        private readonly messagesWsService: MessagesWsService,
        private readonly jwtService: JwtService,
    ) {}

    async handleConnection(client: Socket) {
        const token = client.handshake.headers.authorization as string;
        let payload: JwtPayload;

        try {
            payload = this.jwtService.verify(token);
            await this.messagesWsService.registerClient(client, payload.id);
        } catch (error) {
            return client.disconnect();
        }

        this.wss.emit(
            'clients-connected',
            this.messagesWsService.getConnectedClients(),
        );
    }

    handleDisconnect(client: Socket) {
        this.messagesWsService.removeClient(client.id);
        this.wss.emit(
            'clients-connected',
            this.messagesWsService.getConnectedClients(),
        );
    }

    @SubscribeMessage('message-from-client')
    onMessageFromClient(client: Socket, payload: MessageFromClientDto) {
        this.wss.emit('message-from-server', {
            fullName: this.messagesWsService.getUserFullName(client.id),
            message: payload.message,
        });
    }
}
