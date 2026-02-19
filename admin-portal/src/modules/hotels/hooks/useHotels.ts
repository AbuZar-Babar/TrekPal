import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { approveHotel, fetchHotels, rejectHotel } from '../store/hotelSlice';

interface FetchHotelParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const useHotels = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hotelsState = useSelector((state: RootState) => state.hotels);

  const loadHotels = useCallback(
    (params?: FetchHotelParams) => dispatch(fetchHotels(params)),
    [dispatch]
  );
  const approve = useCallback((id: string, reason?: string) => {
    return dispatch(approveHotel({ id, reason }));
  }, [dispatch]);
  const reject = useCallback((id: string, reason?: string) => {
    return dispatch(rejectHotel({ id, reason }));
  }, [dispatch]);

  return {
    ...hotelsState,
    loadHotels,
    approve,
    reject,
  };
};
