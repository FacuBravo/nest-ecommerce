import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClient {
    [id: string]: { socket: Socket; user: User };
}

@Injectable()
export class MessagesWsService {
    private connectedClients: ConnectedClient = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.isActive) {
            throw new Error('User is not active');
        }

        this.checkExistsUser(user);

        this.connectedClients[client.id] = { socket: client, user };
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }

    checkExistsUser(user: User) {
        for (const socketId of Object.keys(this.connectedClients)) {
            const client = this.connectedClients[socketId];

            if (client.user.id === user.id) {
                client.socket.disconnect();
                delete this.connectedClients[socketId];
                return;
            }
        }
    }
}
