import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchUsers } from '../store/usersSlice';

interface FetchUserParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const usersState = useSelector((state: RootState) => state.users);

  const loadUsers = useCallback(
    (params?: FetchUserParams) => dispatch(fetchUsers(params)),
    [dispatch]
  );

  return {
    ...usersState,
    loadUsers,
  };
};
