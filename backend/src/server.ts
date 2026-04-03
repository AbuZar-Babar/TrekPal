import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { initializeSocketServer } from './ws/socket.server';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import agencyRoutes from './modules/agency/agency.routes';
import hotelRoutes from './modules/hotels/hotel.routes';
import packageRoutes from './modules/packages/packages.routes';
import transportRoutes from './modules/transport/transport.routes';
import tripRequestRoutes from './modules/tripRequests/tripRequest.routes';
import bidRoutes from './modules/bids/bid.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import chatRoutes from './modules/chat/chat.routes';
import adminRoutes from './modules/admin/admin.routes';

/**
 * Initialize Express application
 */
const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketServer(httpServer);

// Middleware
const configuredOrigins = env.CORS_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Allow both admin portal (5174) and agency portal (5173) in development.
const allowedOrigins = Array.from(new Set(
  env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:5174', ...configuredOrigins]
    : configuredOrigins
));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (KYC documents, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Render direct-created services probe the root path by default.
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'trekpal-backend', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const PORT = parseInt(env.PORT, 10);
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health: /health`);
  console.log(`API base path: /api`);
});

export { app, io };
