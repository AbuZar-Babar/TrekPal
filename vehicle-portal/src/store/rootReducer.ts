import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import transportReducer from '../modules/transport/store/transportSlice';
import bookingsReducer from '../modules/bookings/store/bookingsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  transport: transportReducer,
  bookings: bookingsReducer,
});

export default rootReducer;
