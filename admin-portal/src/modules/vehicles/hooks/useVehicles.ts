import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { approveVehicle, fetchVehicles, rejectVehicle } from '../store/vehiclesSlice';

interface FetchVehicleParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const useVehicles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vehiclesState = useSelector((state: RootState) => state.vehicles);

  const loadVehicles = useCallback(
    (params?: FetchVehicleParams) => dispatch(fetchVehicles(params)),
    [dispatch]
  );
  const approve = useCallback((id: string, reason?: string) => {
    return dispatch(approveVehicle({ id, reason }));
  }, [dispatch]);
  const reject = useCallback((id: string, reason?: string) => {
    return dispatch(rejectVehicle({ id, reason }));
  }, [dispatch]);

  return {
    ...vehiclesState,
    loadVehicles,
    approve,
    reject,
  };
};
