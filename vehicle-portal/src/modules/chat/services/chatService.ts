import { io, Socket } from 'socket.io-client';

import apiClient from '../../../shared/services/apiClient';
import { ChatMessage, ChatRoom } from '../../../shared/types';

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

const resolveSocketBaseUrl = (): string => {
  if (rawApiBase === '/api') {
    return window.location.origin;
  }

  try {
    const url = new URL(rawApiBase, window.location.origin);
    const path = url.pathname.endsWith('/api')
      ? url.pathname.slice(0, -4) || '/'
      : url.pathname;

    return new URL(path, url.origin).toString();
  } catch {
    return window.location.origin;
  }
};

class ChatService {
  private socket: Socket | null = null;

  async getRooms(): Promise<ChatRoom[]> {
    const response = await apiClient.get('/chat/rooms');
    return response.data.data || [];
  }

  async getRoom(roomId: string): Promise<ChatRoom> {
    const response = await apiClient.get(`/chat/rooms/${roomId}`);
    return response.data.data;
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`);
    return response.data.data || [];
  }

  joinRoom(
    roomId: string,
    handlers: {
      onMessage: (message: ChatMessage) => void;
      onError: (message: string) => void;
    },
  ) {
    const socket = this.ensureSocket(handlers.onError);

    socket.off('chat:new-message');
    socket.off('chat:error');
    socket.off('connect_error');

    socket.on('chat:new-message', (payload: ChatMessage) => {
      handlers.onMessage(payload);
    });

    socket.on('chat:error', (payload: { message?: string }) => {
      handlers.onError(payload?.message || 'Chat request failed');
    });

    socket.on('connect_error', (error: Error) => {
      handlers.onError(error.message || 'Chat connection failed');
    });

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('chat:join-room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('chat:leave-room', roomId);
  }

  sendMessage(roomId: string, content: string) {
    const socket = this.ensureSocket(() => undefined);
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('chat:send-message', { roomId, content });
  }

  dispose() {
    this.socket?.disconnect();
    this.socket = null;
  }

  private ensureSocket(onError: (message: string) => void): Socket {
    if (this.socket) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Sign in again to use offer chat');
    }

    const socket = io(resolveSocketBaseUrl(), {
      transports: ['websocket'],
      autoConnect: false,
      auth: { token },
    });

    socket.on('chat:error', (payload: { message?: string }) => {
      onError(payload?.message || 'Chat request failed');
    });

    this.socket = socket;
    return socket;
  }
}

export const chatService = new ChatService();
