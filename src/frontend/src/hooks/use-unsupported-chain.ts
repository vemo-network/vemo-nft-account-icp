import { supportedChains } from "src/wagmi";
import { useChainId } from "wagmi";
import { useAuthSaga } from "./use-auth";

export const useUnsupportedChain = () => {
  const { chainId: connectedChainId, chain } = useAuthSaga();
  const chainId = useChainId();
  const isUnSupportedChain =
    !supportedChains.find((e) => e.id === chainId) && !!connectedChainId;
  return isUnSupportedChain || !chain;
};
