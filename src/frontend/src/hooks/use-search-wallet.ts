import { useSmartWallet } from "@context/smart-wallet-context";
import { useCallback } from "react";
import { FilterParams } from "src/types/smart-wallet";

export const useSearchWallet = () => {
  const data = useSmartWallet();
  const handleSearchWallet = useCallback(
    (params: FilterParams) => {
      data.setFilter && data.setFilter(params);
    },
    [data.setFilter]
  );
  return {
    handleSearchWallet,
    filterData: data.filterParams,
  };
};
