import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { initializeChatSocket } from './chat.socket';

/**
 * Initialize WebSocket server
 * @param httpServer - HTTP server instance
 * @returns Socket.IO server instance
 */
export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  const configuredOrigins = env.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = Array.from(
    new Set(
      env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://localhost:5174', ...configuredOrigins]
        : configuredOrigins,
    ),
  );

  const io = new SocketServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by Socket.IO CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Initialize chat socket handlers
  initializeChatSocket(io);

  return io;
};

