import { ReactNode } from "react";
import { ChainId } from "src/configs/constants/chain";
import { useAuthSaga } from "src/hooks/use-auth";
import { useUnsupportedChain } from "src/hooks/use-unsupported-chain";
import { getChainById } from "src/utils/chain.utils";
import { SwitchChainButton } from "./switch-chain-button";

export const SwitchChainWrapped = ({
  chainId,
  action,
  children,
  callback,
}: {
  chainId: ChainId;
  action: string;
  children: ReactNode;
  callback?: any;
}) => {
  const selectedChain = getChainById(Number(chainId));
  const { chainId: connectedChainId } = useAuthSaga();
  const isWrongChain = Number(chainId) !== connectedChainId;
  const isUnsupportedChain = useUnsupportedChain();

  if (isWrongChain || isUnsupportedChain) {
    return (
      <SwitchChainButton
        chain={selectedChain!}
        label={action}
        callback={callback}
      />
    );
  }
  return children;
};
