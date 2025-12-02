import express, { Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env';
import { initializeFirebase } from './config/firebase';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { initializeSocketServer } from './ws/socket.server';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import agencyRoutes from './modules/agency/agency.routes';
import hotelRoutes from './modules/hotels/hotel.routes';
import transportRoutes from './modules/transport/transport.routes';
import tripRequestRoutes from './modules/tripRequests/tripRequest.routes';
import bidRoutes from './modules/bids/bid.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import adminRoutes from './modules/admin/admin.routes';

/**
 * Initialize Express application
 */
const app: Express = express();
const httpServer = createServer(app);

// Initialize Firebase (optional in development)
try {
  initializeFirebase();
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
  console.warn('⚠️  Firebase initialization skipped in development mode');
}

// Initialize Socket.IO
const io = initializeSocketServer(httpServer);

// Middleware
// Allow both admin portal (5174) and agency portal (5173) in development
const allowedOrigins = env.NODE_ENV === 'development'
  ? ['http://localhost:5173', 'http://localhost:5174', env.CORS_ORIGIN]
  : [env.CORS_ORIGIN];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const PORT = parseInt(env.PORT, 10);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export { app, io };

