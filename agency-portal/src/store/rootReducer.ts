import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import transportReducer from '../modules/transport/store/transportSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  transport: transportReducer,
});

export default rootReducer;
