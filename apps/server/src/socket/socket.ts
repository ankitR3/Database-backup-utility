import { WebSocketServer, WebSocket } from 'ws';
import { ClientMessage, MessageType, ServerMessage } from './socket.types';

const rooms = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: any) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (socket) => {
        console.log('ws connected');

        socket.on('message', (message) => {
            try {
                const data: ClientMessage = JSON.parse(message.toString());

                switch (data.type) {
                    case MessageType.SUBSCRIBE: {
                        const { configId } = data;
                        if (!rooms.has(configId)) {
                            rooms.set(configId, new Set());
                        }
                        rooms.get(configId)?.add(socket);
                        break;
                    }
                    case MessageType.UNSUBSCRIBE: {
                        const { configId } = data;
                        rooms.get(configId)?.delete(socket);
                        break;
                    }
                    default:
                        console.log('Unknown ws message');
                }
            } catch (err) {
                console.log('ws parse error: ', err);
            }
        });

        socket.on('close', () => {
            rooms.forEach((room) => {
                room.delete(socket);
            });
        });
    });
}

export function notifyBackupComplete(configId: string) {
    const room = rooms.get(configId);

    if (!room) {
        return;
    }

    const message: ServerMessage = {
        type: MessageType.BACKUP_COMPLETE,
        configId,
    };

    room.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    });

    console.log(`Notified backup for ${configId}`);
}