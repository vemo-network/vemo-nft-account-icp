import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ModalName, ModalType } from "@store/modal-service";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import tbaAbi from "src/configs/abis/VemoWallet.json";
import walletAbi from "src/configs/abis/WalletFactory.json";
import api from "src/services";
import { Project } from "src/types/collection.type";
import { EventsName, IEventData, Wallet } from "src/types/smart-wallet";
import { formatOnchainError } from "src/utils/error.util";
import { handleERC6551AccountCreated } from "src/utils/handle-event.utils";
import { utilsNotification } from "src/utils/notification-utils";
import { Address } from "viem";
import {
  useDisconnect,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useAuthSaga } from "./use-auth";
import {
  useCollectionDetailConfig,
  useConnectedChainConfig,
} from "./use-config";
import { useLoadingOverlay } from "./use-loading-overlay";
import { useCloseModal, useOpenModal } from "./use-modal";

export const useCreateWallet = (callback?: () => void, handleClose?: any) => {
  const { writeContractAsync, data, error } = useWriteContract();
  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash: data,
    confirmations: 1,
  });
  const collection = useCollectionDetailConfig();
  const config = useConnectedChainConfig();
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();
  const { chainId, address } = useAuthSaga();
  const [project, setProject] = useState<Project | null>();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // const handleEvent = async (eventData: IEventData) => {
  //   return await api.WalletService.handleEvent({
  //     event_type: EventsName.WalletCreated,
  //     chain_id: chainId,
  //     data: eventData,
  //   });
  // };

  useEffect(() => {
    if (txData && isFetched && project) {
      const eventData = handleERC6551AccountCreated(txData);
      // const args = eventData?.args;
      // const data = {
      //   account: args?.account,
      //   nftCollection: args?.tokenContract,
      //   tokenId: args?.tokenId?.toString(),
      //   owner: address,
      // };
      // handleEvent(data as IEventData).then((res) => {
      //   if (res) {
      //     setTimeout(
      //       () => !!callback && callback(),
      //       project?.chainId === 1 ? 5000 : 2000
      //     );
      //   }
      // });
     setTimeout(() => callback && callback(), 3000)

      setTimeout(() => {
        showLoading(false);
        onOpen({
          data: {
            project,
            chainId,
            account: eventData?.args?.account,
            tokenId: eventData?.args?.tokenId?.toString(),
            callback: handleClose,
          },
          name: ModalName.CREATE_WALLET,
          type: ModalType.SUCCESS,
        });
      }, 5000);
    }
  }, [isFetched, txData, project, callback]);

  const handleCreateWallet = useCallback(
    async (project?: Project) => {
      if (!address && openConnectModal) {
        return openConnectModal();
      }
      if (!collection) {
        return;
      }
      showLoading(true);
      setProject((collection as any) ?? project);
      try {
        await writeContractAsync({
          abi: walletAbi,
          address: config?.config?.WALLET_FACTORY as Address,
          functionName: "create",
          args: [collection?.contractAddress],
        });
      } catch (error) {
        console.log("error :>> ", error);
        const customError: any = formatOnchainError(error);
        utilsNotification.error(customError?.message);
        showLoading(false);
        // Optionally handle error
      }
    },
    [
      chainId,
      showLoading,
      txData,
      writeContractAsync,
      address,
      disconnect,
      collection,
      config,
    ]
  );
  return {
    handleCreateWallet: handleCreateWallet,
  };
};

export const useCreateTBA = (callback?: () => void) => {
  const { writeContractAsync, data, error } = useWriteContract();
  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash: data,
    confirmations: 1,
  });
  const collection = useCollectionDetailConfig();
  const config = useConnectedChainConfig();
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();
  const { chainId, address } = useAuthSaga();
  const [project, setProject] = useState<Project | null>();
  const { disconnect } = useDisconnect();
  const { onClose } = useCloseModal();
  const dispatch = useDispatch();
  const { openConnectModal } = useConnectModal();

  const handleEvent = async (eventData: IEventData) => {
    return await api.WalletService.handleEvent({
      event_type: EventsName.WalletCreated,
      chain_id: chainId,
      data: eventData,
    });
  };

  useEffect(() => {
    if (txData && isFetched && project) {
      const eventData = handleERC6551AccountCreated(txData);
      const args = eventData?.args;
      const data = {
        account: args?.account,
        nftCollection: args?.tokenContract,
        tokenId: args?.tokenId?.toString(),
        owner: address,
      };
      handleEvent(data as IEventData).then((res) => {
        if (res) {
          setTimeout(
            () => !!callback && callback(),
            project?.chainId === 1 ? 5000 : 2000
          );
        }
      });
      setTimeout(() => {
        showLoading(false);
        onOpen({
          data: {
            project,
            chainId,
            account: eventData?.args?.account,
            tokenId: eventData?.args?.tokenId?.toString(),
          },
          name: ModalName.CLONE_WALLET,
          type: ModalType.SUCCESS,
        });
      }, 3000);
    }
  }, [isFetched, txData, project, callback]);

  const handleCreateWallet = useCallback(
    async (wallet: Wallet) => {
      if (!address && openConnectModal) {
        return openConnectModal();
      }
      if (!collection) {
        return;
      }
      showLoading(true);
      setProject((collection as any) ?? project);
      try {
        // await ;
        await writeContractAsync({
          abi: walletAbi,
          address: config?.config?.WALLET_FACTORY as Address,
          functionName: "createTBA",
          args: [collection?.contractAddress, wallet.token_id, wallet.chain_id],
        });
      } catch (error) {
        console.log("error", error);
        const customError: any = formatOnchainError(error);
        utilsNotification.error(customError?.message);
        showLoading(false);
        // Optionally handle error
      }
    },
    [
      chainId,
      showLoading,
      txData,
      writeContractAsync,
      address,
      disconnect,
      collection,
      config,
    ]
  );
  return {
    handleCreateTBA: handleCreateWallet,
  };
};

export const useDelegate = (callback?: () => void) => {
  const { writeContractAsync, data, error } = useWriteContract();
  const { data: txData, isFetched } = useWaitForTransactionReceipt({
    hash: data,
    confirmations: 1,
  });
  const config = useConnectedChainConfig();
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();
  const { chainId, address } = useAuthSaga();
  const [project, setProject] = useState<{
    tokenId: number;
    tokenAddress: string;
    account: string;
    chainId: number;
  } | null>();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (txData && isFetched && project) {
      setTimeout(() => {
        showLoading(false);
        onOpen({
          data: {
            project,
            chainId,
            account: project?.account,
            tokenId: project.tokenId?.toString(),
          },
          name: ModalName.DELEGATE_WALLET,
          type: ModalType.SUCCESS,
        });
      }, 2000);
      setTimeout(() => !!callback && callback(), 2500);
    }
  }, [isFetched, txData, project, callback]);

  const handleDelegate = useCallback(
    async (
      wallet: Wallet,
      collection: {
        contractAddress: string;
      },
      farmer: {
        address: string;
      }
    ) => {
      if (!address && openConnectModal) {
        return openConnectModal();
      }
      if (!collection) {
        return;
      }
      showLoading(true);
      setProject({
        tokenAddress: collection.contractAddress as any,
        chainId: wallet.chain_id,
        account: wallet.tba_address,
        tokenId: wallet.token_id,
      });
      try {
        await writeContractAsync({
          abi: tbaAbi,
          address: wallet.tba_address,
          functionName: "delegate",
          args: [
            ((config?.config?.DELEGATION_CONTRACTS as any)[0]
              ?.contractAddress as Address) ?? "",
            farmer.address,
          ],
        });
      } catch (error) {
        console.log("error", error);
        const customError: any = formatOnchainError(error);
        utilsNotification.error(customError?.message);
        showLoading(false);
        // Optionally handle error
      }
    },
    [
      chainId,
      showLoading,
      txData,
      writeContractAsync,
      address,
      disconnect,
      config,
    ]
  );
  return {
    handleDelegate: handleDelegate,
  };
};
