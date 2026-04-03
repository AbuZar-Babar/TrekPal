import { Server as SocketServer, Socket } from 'socket.io';
import { ROLES } from '../config/constants';
import { chatService } from '../modules/chat/chat.service';
import { ChatActor } from '../modules/chat/chat.types';
import { verifyJWT } from '../utils/jwt.util';

const chatRoomName = (roomId: string): string => `chat-room-${roomId}`;

const getSocketToken = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const headerValue = socket.handshake.headers.authorization;
  if (typeof headerValue === 'string' && headerValue.startsWith('Bearer ')) {
    return headerValue.slice(7).trim();
  }

  const queryToken = socket.handshake.query.token;
  if (typeof queryToken === 'string' && queryToken.trim()) {
    return queryToken.trim();
  }

  return null;
};

const emitChatError = (socket: Socket, error: unknown): void => {
  const message =
    error instanceof Error && error.message.trim()
      ? error.message
      : 'Chat request failed';

  socket.emit('chat:error', { message });
};

export const initializeChatSocket = (io: SocketServer): void => {
  io.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        next(new Error('Authentication required'));
        return;
      }

      const payload = verifyJWT(token);
      const actor = await chatService.resolveActorFromAuth(payload.uid, payload.role);

      socket.data.actor = actor;
      next();
    } catch (error) {
      next(
        new Error(
          error instanceof Error && error.message.trim()
            ? error.message
            : 'Authentication failed',
        ),
      );
    }
  });

  io.on('connection', (socket) => {
    const actor = socket.data.actor as ChatActor | undefined;
    if (!actor) {
      socket.disconnect(true);
      return;
    }

    socket.on('chat:join-room', async (roomId: string) => {
      try {
        if (!roomId?.trim()) {
          throw new Error('Room is required');
        }

        const room = await chatService.getRoomById(roomId.trim(), actor);
        socket.join(chatRoomName(room.id));
        socket.emit('chat:room-joined', room);
      } catch (error) {
        emitChatError(socket, error);
      }
    });

    socket.on('chat:leave-room', (roomId: string) => {
      if (!roomId?.trim()) {
        return;
      }

      socket.leave(chatRoomName(roomId.trim()));
      socket.emit('chat:room-left', { roomId: roomId.trim() });
    });

    socket.on('chat:send-message', async (payload: { roomId?: string; content?: string }) => {
      try {
        const roomId = payload.roomId?.trim();
        const content = payload.content?.trim() ?? '';

        if (!roomId) {
          throw new Error('Room is required');
        }

        const message = await chatService.createMessage(roomId, actor, content);
        io.to(chatRoomName(roomId)).emit('chat:new-message', message);
      } catch (error) {
        emitChatError(socket, error);
      }
    });

    socket.on('disconnect', () => {
      if (actor.role === ROLES.AGENCY) {
        console.log(`Agency disconnected from chat: ${actor.agencyId}`);
      } else {
        console.log(`Traveler disconnected from chat: ${actor.travelerId}`);
      }
    });
  });
};
