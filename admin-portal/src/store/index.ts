import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import agencyReducer from '../modules/agencies/store/agencySlice';
import hotelReducer from '../modules/hotels/store/hotelSlice';
import vehiclesReducer from '../modules/vehicles/store/vehiclesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agencies: agencyReducer,
    hotels: hotelReducer,
    vehicles: vehiclesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
