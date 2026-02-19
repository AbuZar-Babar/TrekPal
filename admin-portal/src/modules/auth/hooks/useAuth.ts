import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { clearError, getProfile, login, logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const loginUser = useCallback(
    (email: string, password: string) => dispatch(login({ email, password })),
    [dispatch]
  );

  const fetchProfile = useCallback(() => dispatch(getProfile()), [dispatch]);
  const logoutUser = useCallback(() => dispatch(logout()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    ...authState,
    loginUser,
    fetchProfile,
    logoutUser,
    clearAuthError,
  };
};

