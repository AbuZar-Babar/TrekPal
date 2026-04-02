import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import transportReducer from '../modules/transport/store/transportSlice';
import hotelsReducer from '../modules/hotels/store/hotelsSlice';
import packagesReducer from '../modules/packages/store/packagesSlice';
import tripRequestsReducer from '../modules/tripRequests/store/tripRequestsSlice';
import bidsReducer from '../modules/bids/store/bidsSlice';
import bookingsReducer from '../modules/bookings/store/bookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transport: transportReducer,
    hotels: hotelsReducer,
    packages: packagesReducer,
    tripRequests: tripRequestsReducer,
    bids: bidsReducer,
    bookings: bookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
