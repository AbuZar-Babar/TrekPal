import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import agencyReducer from '../modules/agencies/store/agencySlice';
import hotelReducer from '../modules/hotels/store/hotelSlice';
import vehiclesReducer from '../modules/vehicles/store/vehiclesSlice';
import usersReducer from '../modules/users/store/usersSlice';
import reportsReducer from '../modules/reports/store/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agencies: agencyReducer,
    hotels: hotelReducer,
    vehicles: vehiclesReducer,
    users: usersReducer,
    reports: reportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
