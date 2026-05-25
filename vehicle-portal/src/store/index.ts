import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import transportReducer from '../modules/transport/store/transportSlice';
import bookingsReducer from '../modules/bookings/store/bookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transport: transportReducer,
    bookings: bookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
