import { useCallback } from "react";
import { useAuthSaga } from "src/hooks/use-auth";
import { Chain } from "viem";
import { useSwitchChain } from "wagmi";
import { PrimaryButton } from "./primary-button";

export const SwitchChainButton = ({
  chain,
  label,
  callback,
}: {
  chain: Chain;
  label?: string;
  callback?: any;
}) => {
  const { address } = useAuthSaga();

  const { switchChainAsync } = useSwitchChain();
  const handleSwitchNetwork = useCallback(() => {
    if (!address || !chain.id) return;
    switchChainAsync({
      chainId: chain.id,
    }).then((res) => {
      if (res && callback) {
        return callback();
      }
    });
  }, [chain]);

  return (
    <PrimaryButton
      className="!w-full h-12 rounded-lg !bg-blue-150 !border-none text-base"
      onClick={handleSwitchNetwork}
    >
      Switch chain to {label}
    </PrimaryButton>
  );
};
