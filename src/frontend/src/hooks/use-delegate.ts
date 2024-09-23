import { ChainId } from "@pancakeswap/chains";
import { ModalName, ModalType } from "@store/modal-service";
import { ZeroAddress } from "ethers6";
import _, { capitalize } from "lodash";
import { useCallback, useEffect, useState } from "react";
import nftDelegationABI from "src/configs/abis/VemoDelegationContract.json";
import tbaAbi from "src/configs/abis/VemoWallet.json";
import {
  IDelegationContract,
  IOnchainSmartWallet,
  Wallet,
} from "src/types/smart-wallet";
import { utilsNotification } from "src/utils/notification-utils";
import { erc721Abi, maxInt256 } from "viem";
import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { useLoadingOverlay } from "./use-loading-overlay";
import { useOpenModal } from "./use-modal";
import { getChainById } from "src/utils/chain.utils";

const abi = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "issuer",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
];
export const useGetDelegate = (wallet: Wallet | IOnchainSmartWallet) => {
  // const delegationsContracts = useDelegationContract(wallet.chain_id);
  // const { address: account } = useAuthSaga();
  // const farmers = useFarmerConfig();

  const { data: delegateData, error } = useReadContract({
    abi: tbaAbi,
    address: wallet?.tba_address as any,
    functionName: "delegates",
    args: [ZeroAddress, 29],
    chainId: wallet?.chain_id,
  }) as any;

  const unitData: any = delegateData?.length ? _.uniq(delegateData as any) : [];
  const { data: delegationDetail } = useReadContracts({
    contracts: unitData?.map((e: string) => {
      return {
        address: e,
        abi: abi,
        functionName: "name",
        args: [],
        chainId: wallet.chain_id,
      };
    }),
  });
  const calls = unitData?.map((e: string) => {
    return {
      address: e,
      abi: erc721Abi,
      chainId: wallet.chain_id,
      functionName: "ownerOf",
      args: [wallet.token_id],
    };
  });
  const {
    data: delegateDetails,
    refetch,
    isLoading,
    isFetching,
  } = useReadContracts({
    contracts: calls as any,
  });
  const filterData = delegateDetails
    ?.map((e, i) => {
      const name: any = delegationDetail ? delegationDetail[i].result : "";
      const chainName = capitalize(
        getChainById(Number(wallet?.chain_id ?? 1))?.name
      );

      return {
        ...e,
        collection: delegateData && {
          address: delegateData[i],
          name: name.replace(chainName, ""),
        },
      };
    })
    ?.filter((e) => e.status !== "failure");
  if (!filterData) {
    return {
      data: null,
    };
  }
  const data = filterData
    .map((e) => {
      return {
        ...e,
        address: e.result as string,
      };
    })
    .filter(Boolean);
  return {
    data: data,
    refetch,
    isLoading: isFetching || isLoading,
  };
};

export const useDelegate = (wallet: Wallet | IOnchainSmartWallet) => {
  const [delegated, setDelegated] = useState(false);
  const { writeContractAsync, isPending, error } = useWriteContract();
  const setDelegate = useCallback(
    async (delegationContractAddress: string) => {
      const res = await writeContractAsync({
        abi: tbaAbi,
        address: wallet.tba_address as any,
        functionName: "setDelegate",
        args: [delegationContractAddress],
      });
      if (res) {
        utilsNotification.success("Delegation is successfully");
        setDelegated(true);
      }
    },
    [wallet]
  );
  return {
    setDelegate,
    isPending,
    error,
    delegated,
    setDelegated,
  };
};

export const useIsDelegated = (wallet: Wallet | IOnchainSmartWallet) => {
  const { data, isLoading, refetch } = useReadContract({
    abi: tbaAbi,
    address: wallet.tba_address as any,
    functionName: "getDelegate",
    args: [],
    chainId: wallet.chain_id,
  });
  console.log("data", data);
  return {
    data: data && data !== ZeroAddress,
    isLoading,
    refetch,
  };
};

export const useRevokeTimeout = (
  delegationContract: IDelegationContract,
  wallet: Wallet | IOnchainSmartWallet
) => {
  const { data: revokeTime, isLoading } = useReadContract({
    abi: nftDelegationABI,
    address: delegationContract?.contractAddress as any,
    functionName: "revokingRoles",
    args: [wallet.token_id],
    chainId: wallet.chain_id,
  });
  return {
    data: revokeTime ?? 0,
    isLoading,
  };
};

export const useRevoke = (callback?: any) => {
  const { writeContractAsync, isPending, error, data } = useWriteContract();
  const { onOpen } = useOpenModal();
  const { showLoading } = useLoadingOverlay();

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        showLoading(false);

        onOpen({
          data: {},
          name: ModalName.REVOKE_WALLET,
          type: ModalType.SUCCESS,
        });
      }, 1000);
    }
  }, [data]);
  const onRevoke = useCallback(
    async (
      wallet: Wallet | IOnchainSmartWallet,
      delegationContract: IDelegationContract
    ) => {
      try {
        showLoading(true);
        await writeContractAsync({
          abi: tbaAbi,
          address: wallet.tba_address as any,
          functionName: "revoke",
          args: [delegationContract.contractAddress],
        });
      } catch (error) {
        console.log(
          "delegationContract.contractAddress, error",
          delegationContract.contractAddress,
          error
        );
        showLoading(false);
        utilsNotification.error("Failed to revoke");
      }
    },
    []
  );
  return {
    onRevoke,
    isPending,
    error,
  };
};

export const useRelease = (callback?: any) => {
  const { writeContractAsync, isPending, error, data } = useWriteContract();
  useEffect(() => {
    if (data) {
      utilsNotification.success("Release is successfully");
      callback && callback();
    }
  }, [data]);
  const onRelease = useCallback(
    async (
      wallet: Wallet | IOnchainSmartWallet,
      delegationContract: IDelegationContract
    ) => {
      try {
        await writeContractAsync({
          abi: tbaAbi,
          address: wallet.tba_address as any,
          functionName: "burn",
          args: [wallet.wallet_collection.contractAddress],
        });
      } catch (error) {
        utilsNotification.error("Failed to release");
      }
    },
    []
  );
  return {
    onRelease,
    isPending,
    error,
  };
};
