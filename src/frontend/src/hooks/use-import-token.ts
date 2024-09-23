import { useMutation, useQuery } from "@tanstack/react-query";
import { ZeroAddress } from "ethers6";
import { useCallback } from "react";
import api from "src/services";
import { utilsNotification } from "src/utils/notification-utils";
import { saveLocalStorageData } from "src/utils/storage.utils";
import { Address } from "viem";
import { useAuthSaga } from "./use-auth";

export const useImportToken = () => {
  const { chainId, address } = useAuthSaga();
  const { mutateAsync, data, isPending } = useMutation({
    mutationFn: (tokenAddress: Address) => {
      return api.WalletService.importToken({
        token_address: tokenAddress as any,
        chain_id: chainId,
        wallet_address: address as any,
      });
    },
    onSuccess: (data) => {
      saveLocalStorageData("token-import", JSON.stringify([data]));
      utilsNotification.success("Token imported successfully");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      utilsNotification.error(msg ?? "Import token failed");
    },
  });
  const handleImport = useCallback(
    async (tokenAddress: Address) => {
      const res = await mutateAsync(tokenAddress);
      return res;
    },
    [mutateAsync]
  );
  return {
    handleImport,
    isPending,
    data,
  };
};
