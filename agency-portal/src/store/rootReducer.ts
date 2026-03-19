import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import transportReducer from '../modules/transport/store/transportSlice';
import hotelsReducer from '../modules/hotels/store/hotelsSlice';
import tripRequestsReducer from '../modules/tripRequests/store/tripRequestsSlice';
import bidsReducer from '../modules/bids/store/bidsSlice';
import bookingsReducer from '../modules/bookings/store/bookingsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  transport: transportReducer,
  hotels: hotelsReducer,
  tripRequests: tripRequestsReducer,
  bids: bidsReducer,
  bookings: bookingsReducer,
});

export default rootReducer;
