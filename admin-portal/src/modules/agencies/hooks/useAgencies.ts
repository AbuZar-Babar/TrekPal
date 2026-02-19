import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  approveAgency,
  deleteAgency,
  fetchAgencies,
  rejectAgency,
} from '../store/agencySlice';

interface FetchAgencyParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const useAgencies = () => {
  const dispatch = useDispatch<AppDispatch>();
  const agenciesState = useSelector((state: RootState) => state.agencies);

  const loadAgencies = useCallback(
    (params?: FetchAgencyParams) => dispatch(fetchAgencies(params)),
    [dispatch]
  );
  const approve = useCallback((id: string, reason?: string) => {
    return dispatch(approveAgency({ id, reason }));
  }, [dispatch]);
  const reject = useCallback((id: string, reason?: string) => {
    return dispatch(rejectAgency({ id, reason }));
  }, [dispatch]);
  const remove = useCallback((id: string) => dispatch(deleteAgency(id)), [dispatch]);

  return {
    ...agenciesState,
    loadAgencies,
    approve,
    reject,
    remove,
  };
};
