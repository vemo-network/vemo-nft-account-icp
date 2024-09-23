import { useSmartWallet } from "@context/smart-wallet-context";
import { RootState } from "@store/index";
import { useSelector } from "react-redux";
import { ChainId } from "src/configs/constants/chain";
import { useAuthSaga } from "./use-auth";

export const useAllChainConfig = () => {
  const data = useSelector((state: RootState) => state.global.configs);
  return data;
};

export const useChainConfig = (chainId?: ChainId) => {
  const configs = useAllChainConfig();
  const { chainId: connectedChainId } = useAuthSaga();
  return configs.find((e) => e.chainId === (chainId ?? connectedChainId));
};

export const useConnectedChainConfig = () => {
  const data = useSmartWallet();
  const chainConfig = data?.configs;

  const { chainId } = useAuthSaga();

  return (
    chainConfig?.length &&
    (chainConfig.find((e) => e.chainId === chainId) as any)
  );
};

export const useCollectionDetailConfig = () => {
  const data = useSmartWallet();
  return data?.collectionDetail;
};

export const useGlobalData = () => {
  return useSelector((state: RootState) => state.global);
};

export const useSelectedChain = () => {
  const { chainId } = useAuthSaga();
  return useGlobalData().selectChain ?? { id: chainId };
};

export const useFarmerConfig = () => {
  const config = useChainConfig();
  const { address } = useAuthSaga();
  return config?.config.FARMER_CONTRACTS?.map((e) => {
    return {
      ...e,
      address: e.address ? e.address : address ?? '',
    };
  });
};

export const useDelegationContract = (chainId?: ChainId) => {
  const config = useChainConfig(chainId);
  return config?.config.DELEGATION_CONTRACTS;
};
