import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { initializeChatSocket } from './chat.socket';

/**
 * Initialize WebSocket server
 * @param httpServer - HTTP server instance
 * @returns Socket.IO server instance
 */
export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize chat socket handlers
  initializeChatSocket(io);

  return io;
};

