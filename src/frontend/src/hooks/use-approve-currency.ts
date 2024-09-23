import { waitForTransaction, writeContract } from "@wagmi/core";
import { BigNumberish } from "ethers";
import { useEffect, useMemo } from "react";
import { formattingUtils } from "src/utils/formatting-utils";
import { utilsNotification } from "src/utils/notification-utils";
import { Address, erc20Abi } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useAuthSaga } from "./use-auth";
import { useChainConfig, useConnectedChainConfig } from "./use-config";
import { useLoadingOverlay } from "./use-loading-overlay";

export interface Props {
  token: Address;
  value: bigint;
  spender: Address;
}

export function useApproveCurrency(props: Props) {
  const { chainId } = useAuthSaga();
  const { showLoading } = useLoadingOverlay();
  const contract = useMemo(() => {
    return {
      address: props.token as Address,
      abi: erc20Abi,
    };
  }, [props.token]);
  const { writeContractAsync, data, isPending, isSuccess } = useWriteContract();
  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash: data,
    confirmations: 2,
  });
  useEffect(() => {
    if (txData && isFetched) {
      showLoading(false);
      utilsNotification.success("Approve success");
    }
  }, [isFetched, txData]);
  const handleApprove = async (value = BigInt("0")) => {
    try {
      showLoading(true);
      await writeContractAsync({
        ...contract,
        functionName: "approve",
        args: [props?.spender, !!Number(value) ? value : props?.value],
      });
    } catch (err) {
      showLoading(false);
    }
  };
  return {
    handleApprove,
    isPending: isSuccess,
  };
}

export const useApprovalOf = (currency: string, value?: any) => {
  const config = useConnectedChainConfig();
  const { chain } = useAuthSaga();

  return useMemo(() => {
    if (chain?.id) {
      const walletFactory = config?.config?.WALLET_FACTORY;
      return {
        spender: walletFactory,
        value: value,
        token: currency,
      };
    }
  }, [config, chain?.id]);
};
