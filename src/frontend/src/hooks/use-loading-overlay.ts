import { RootState } from "@store/index";
import { setLoading } from "@store/loading";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useLoadingOverlay = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.ui);

  const showLoading = useCallback(
    (show?: boolean, withWarning = false) => {
      try {
        dispatch(setLoading({ isLoading: !!show, withWarning }));
      } catch (error) {}
    },
    [dispatch]
  );

  // re-memo
  return useMemo(
    () => ({
      isLoading,
      showLoading,
    }),
    [dispatch, showLoading]
  );
};
