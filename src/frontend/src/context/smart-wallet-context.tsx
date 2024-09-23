import api from "src/services";
import { setGlobalConfig, setTokenConfig } from "@store/global";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import {
  useOnChainWalletStored,
  useWalletsOnchain,
} from "src/hooks/use-wallet";
import { Collection, IPlatform } from "src/types/platform.type";
import {
  ChainConfigData,
  FilterParams,
  IOnchainSmartWallet,
  Wallet,
} from "src/types/smart-wallet";
import { getAllOnChainSmartWallets } from "src/utils/chain.utils";
import { supportedChains } from "src/wagmi";
import { ModalProvider } from "./provider/ModalProvider";

// Define the shape of your context's value
interface SmartWalletContextType {
  platforms: IPlatform[] | [];
  configs: ChainConfigData[] | [];
  filterParams?: FilterParams;
  setFilter?: (filterParams: any) => void;
  walletSelected: Wallet | null;
  setWalletSelected: (wallet?: any) => void;
  smartWallet: {
    smartWallets: Wallet[] | IOnchainSmartWallet[] | [];
    isLoading: boolean;
    refetch: () => void;
    allWallets: Wallet[] | [];
    loadingAllWallet: boolean;
  };
  collectionDetail: Collection | null;

  // connectWallet: () => Promise<void>;
  // disconnectWallet: () => void;
  // provider: ethers.providers.Web3Provider | null;
}

// Create the context with default values
const SmartWalletContext = createContext<SmartWalletContextType>({
  // walletAddress: null,
  // connectWallet: async () => {},
  // disconnectWallet: () => {},
  // provider: null,
  platforms: [],
  configs: [],
  walletSelected: null,
  setWalletSelected: () => null,
  smartWallet: {
    smartWallets: [],
    isLoading: true,
    refetch: () => null,
    allWallets: [],
    loadingAllWallet: false,
  },
  collectionDetail: null,
});

// Custom hook to use the SmartWalletContext
export const useSmartWallet = () => useContext(SmartWalletContext);

// Context provider component
export const SmartWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<{
    chain_id: string;
    platform_id?: number;
    tba_address?: string;
  }>({
    chain_id: "",
    platform_id: 0,
    tba_address: "",
  });
  const dispatch = useDispatch();
  const { data: platforms } = useQuery({
    queryKey: ["get-platforms"],
    queryFn: async () => {
      const res = await api.WalletService.getPlatforms();
      if (res?.result?.length) {
        // setPlatforms(res.result)
        return res.result;
      }
    },
  });
  const { address, chainId: connectedChainId } = useAuthSaga();

  const { data: configs, isLoading: loadingConfig } = useQuery({
    queryKey: ["get-chain-configs", connectedChainId],
    queryFn: async () => {
      const res = await Promise.all(
        supportedChains.map(async (e) => {
          return await api.WalletService.getConfigs(e.id);
        })
      );
      if (res) {
        dispatch(setGlobalConfig(res));
      }
      return res ?? [];
    },
    // enabled: !!supportedChains.length,
  });

  useQuery({
    queryKey: ["get-tokens-configs"],
    queryFn: async () => {
      const res = await api.WalletService.getTokensConfig();
      if (res) {
        dispatch(setTokenConfig(res));
      }
      return res ?? [];
    },
    // enabled: !!supportedChains.length,
  });
  const [walletSelected, setWalletSelected] = useState<Wallet | null>(null);
  const chainId = filterParams?.chain_id;
  const platformId = filterParams?.platform_id;
  const smartWallets = useOnChainWalletStored();
  // const {
  //   // data: smartWallets,
  //   refetch,
  //   isLoading,
  // } = useQuery({
  //   queryKey: [`get-nft-account`, chainId, address, platformId],
  //   queryFn: async () => {
  //     const res = await api.WalletService.getWallets({
  //       wallet_address: address ?? "",
  //       chain_id: !!chainId ? chainId?.toString() : (null as any),
  //       platform_id: !!platformId ? platformId : (null as any),
  //     });

  //     if (!chainId && !res.length && res) {
  //       setWalletSelected(null);
  //     }
  //     return res;
  //   },
  //   enabled: !!address,
  // });

  const { data: allWallets, isLoading: loadingAllWallet } = useQuery({
    queryKey: [`get-all-nft-account`, address],
    queryFn: async () => {
      const res = await api.WalletService.getWallets({
        wallet_address: address ?? "",
        chain_id: null as any,
        platform_id: null as any,
      });

      return res;
    },
    enabled: !!address,
  });
  // const { data: collectionDetail } = useQuery({
  //   queryKey: ["get-collection-detail", connectedChainId],
  //   queryFn: async () => {
  //     const res = await api.WalletService.getCollectionDetail({
  //       chainId: connectedChainId,
  //     });
  //     if (res) {
  //       return res;
  //     }
  //   },
  //   enabled: !!connectedChainId,
  // });
  const { isLoading, refetch } = useWalletsOnchain();

  return (
    <SmartWalletContext.Provider
      value={{
        platforms: platforms ?? [],
        filterParams,
        setFilter: setFilterParams,
        configs: configs ?? [],
        walletSelected,
        setWalletSelected,
        smartWallet: {
          smartWallets: smartWallets.reverse() ?? [],
          refetch,
          isLoading: isLoading,
          allWallets: allWallets ?? [],
          loadingAllWallet,
        },
        collectionDetail:
          configs?.length &&
          (configs?.find((e) => Number(e.chainId) === Number(connectedChainId))
            ?.collection as any),
      }}
    >
      <ModalProvider />

      {children}
    </SmartWalletContext.Provider>
  );
};
