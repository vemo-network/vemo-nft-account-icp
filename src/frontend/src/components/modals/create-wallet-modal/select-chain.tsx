import { RenderChainIcon } from "@components/images/render-chain-icon";
import { SelectComponent } from "@components/select";
import clsx from "clsx";
import React, { useMemo } from "react";
import { getChainById } from "src/utils/chain.utils";
import { Chain } from "viem";

export const SelectChain = ({
  currentChain,
  setCurrentChain,
  chains,
  disabled = false,
}: {
  currentChain: Chain | null;
  setCurrentChain: (chain: Chain) => void;
  chains: Chain[];
  disabled: boolean;
}) => {
  const selectChains = useMemo(() => {
    return chains?.map((val, i) => ({
      label: (
        <div className="flex items-center gap-[6px] text-[16px] text-white font-medium ml-4">
          <RenderChainIcon chainId={Number(val.id)} width={22} height={22} />
          {val?.name}
        </div>
      ),
      value: `${val?.id}_${val?.name}`,
    }));
  }, [chains?.length]);
  const onSelectChain = (e: string) => {
    const chainId = e.split("_")[0];
    const chain = getChainById(Number(chainId));
    chain && setCurrentChain(chain);
  };
  return (
    <div className="w-1/2">
      <p className="text-sm py-3">Chain to deploy</p>
      <SelectComponent
        bgfill="dark"
        className={clsx(
          "w-full !h-12 !rounded-lg !bg-dark-600 text-[14px] pl-2"
        )}
        optionsData={selectChains}
        onSelect={onSelectChain}
        placeholder="Select"
        disabled={disabled}
        // defaultValue={currentChain?.name ?? 'Select'}
        // value={`${currentChain?.id}_${currentChain?.name}`}
      />
    </div>
  );
};
