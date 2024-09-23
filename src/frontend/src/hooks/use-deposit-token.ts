import { ModalName, ModalType } from "@store/modal-service";
import { ZeroAddress } from "ethers6";
import { useCallback, useEffect, useState } from "react";
import walletAbi from "src/configs/abis/WalletFactory.json";
import api from "src/services";
import { Project } from "src/types/collection.type";
import { formatOnchainError } from "src/utils/error.util";
import { formattingUtils } from "src/utils/formatting-utils";
import { handleERC6551AccountCreated } from "src/utils/handle-event.utils";
import { utilsNotification } from "src/utils/notification-utils";
import { Address, erc20Abi } from "viem";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useAuthSaga, useCheckLogin } from "./use-auth";
import { useConnectedChainConfig } from "./use-config";
import { useLoadingOverlay } from "./use-loading-overlay";
import { useCurrentOpeningModal, useOpenModal } from "./use-modal";

export const useDepositToken = (callback?: () => void) => {
  const { writeContractAsync, data } = useWriteContract();
  const { data: hash, sendTransactionAsync, error } = useSendTransaction();

  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash: data ?? hash,
    confirmations: 2,
  });
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();
  const { chainId, address } = useAuthSaga();
  const chainConfig = useConnectedChainConfig();
  const [depositData, setDepositData] = useState<{
    tokenAddress: Address;
    amount: string;
    tbaAddress: Address;
    symbol: string;
  } | null>();
  useEffect(() => {
    if (txData && isFetched && depositData) {
      showLoading(false);
      onOpen({
        data: {
          amount: depositData.amount,
          symbol: depositData.symbol,
        },
        name: ModalName.DEPOSIT_TOKEN,
        type: ModalType.SUCCESS,
      });
      setTimeout(() => !!callback && callback(), 2000);
    }
  }, [isFetched, txData, depositData, callback, error]);
  const handleDepositToken = useCallback(
    async ({
      tokenAddress,
      amount,
      tbaAddress,
      symbol,
    }: {
      tokenAddress: Address;
      amount: bigint;
      tbaAddress: Address;
      symbol: string;
    }) => {
      showLoading(true);
      setDepositData({
        tokenAddress,
        amount: formattingUtils.formatUnit(amount).toString(),
        tbaAddress,
        symbol,
      });
      try {
        if (tokenAddress === ZeroAddress) {
          return await sendTransactionAsync({ to: tbaAddress, value: amount });
          // return await writeContractAsync({
          //   abi: walletAbi,
          //   address: chainConfig?.config?.WALLET_FACTORY as Address,
          //   functionName: "depositETH",
          //   args: [tbaAddress],
          //   value: amount,
          // });
        }
        // await ;
        return await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as Address,
          functionName: "transfer",
          args: [tbaAddress, amount],
        });
      } catch (error) {
        const customError: any = formatOnchainError(error);
        utilsNotification.error(customError?.message);
        showLoading(false);
        // Optionally handle error
      }
    },
    [chainId, showLoading, txData, writeContractAsync, address, chainConfig]
  );
  return {
    handleDepositToken: handleDepositToken,
  };
};

export const useDepositStatus = () => {
  const { data } = useCurrentOpeningModal();
  return data?.type;
};
