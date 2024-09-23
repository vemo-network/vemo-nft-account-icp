import { ModalName, ModalType } from "@store/modal-service";
import { ZeroAddress } from "ethers6";
import { useCallback, useEffect, useState } from "react";
import walletAbi from "src/configs/abis/WalletFactory.json";
import { TokenboundClient } from "src/sdk/src";
import api from "src/services";
import { Project } from "src/types/collection.type";
import { formatOnchainError } from "src/utils/error.util";
import { formattingUtils } from "src/utils/formatting-utils";
import { utilsNotification } from "src/utils/notification-utils";
import {
  Address,
  createWalletClient,
  custom,
  erc20Abi,
  http,
  WalletClient,
} from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useAuthSaga, useCheckLogin } from "./use-auth";
import { useLoadingOverlay } from "./use-loading-overlay";
import { useOpenModal } from "./use-modal";
import { useEthersSigner } from "./use-ether-provider";
import { IOnchainSmartWallet, Wallet } from "src/types/smart-wallet";

export const useWithdrawToken = (callback?: () => void) => {
  const [hash, setHash] = useState<Address>("0x");
  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash,
    confirmations: 2,
  });
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();
  const { chainId, address, chain } = useAuthSaga();
  const [withdrawData, setWithdrawData] = useState<{
    tokenAddress: Address;
    amount: string;
    tbaAddress: Address;
    symbol: string;
  } | null>();
  const walletClient: WalletClient = createWalletClient({
    chain: chain,
    account: address,
    // transport: http(),
    transport: window.ethereum ? custom(window.ethereum) : http(),
  });
  const signer = useEthersSigner({
    chainId: chainId,
  });
  const tokenboundClient = new TokenboundClient({
    // walletClient,
    chainId: chainId,
    chain,
    signer
  });
  useEffect(() => {
    if (txData && isFetched && withdrawData) {
      showLoading(false);
      onOpen({
        data: {
          amount: withdrawData.amount,
          symbol: withdrawData.symbol,
        },
        name: ModalName.WITHDRAW_TOKEN,
        type: ModalType.SUCCESS,
      });
      setTimeout(() => !!callback && callback(), 2000);
    }
  }, [isFetched, txData, withdrawData, callback]);
  const handleWithdrawToken = useCallback(
    async ({
      tokenAddress,
      amount,
      tbaAddress,
      symbol,
      decimal,
      walletSelected
    }: {
      tokenAddress: Address;
      amount: string;
      tbaAddress: Address;
      symbol: string;
      decimal: number;
      walletSelected: Wallet | IOnchainSmartWallet
    }) => {
      showLoading(true);
      setWithdrawData({
        tokenAddress,
        amount: amount,
        tbaAddress,
        symbol,
      });
      try {
        // await ;
        let res;
        if (tokenAddress === ZeroAddress) {
          res = await tokenboundClient.transferETH({
            account: tbaAddress,
            amount: amount as any,
            recipientAddress: address as any,
            chainId,
            isDelegate: walletSelected.wallet_collection?.isDelegated,
            delegationContract: walletSelected?.contract_address as any

          });
        } else {
          res = await tokenboundClient.transferERC20({
            account: tbaAddress,
            amount: amount as any,
            recipientAddress: address as any,
            erc20tokenAddress: tokenAddress,
            erc20tokenDecimals: decimal,
            chainId,
            isDelegate: walletSelected.wallet_collection?.isDelegated,
            delegationContract: walletSelected?.contract_address as any
          });
        }

        if (res) {
          setHash(res);
        }
      } catch (error) {
        const customError: any = formatOnchainError(error);
        utilsNotification.error(customError?.message);
        showLoading(false);
        // Optionally handle error
      }
    },
    [chainId, showLoading, txData, address, tokenboundClient]
  );
  return {
    handleWithdrawToken: handleWithdrawToken,
  };
};
