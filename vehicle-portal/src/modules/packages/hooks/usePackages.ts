import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';

export const usePackages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const packagesState = useSelector((state: RootState) => state.packages);

  return {
    dispatch,
    ...packagesState,
  };
};
