import { RenderChainIcon } from "@components/images/render-chain-icon";
import { SearchComponent } from "@components/search-component";
import { SelectComponent } from "@components/select";
import Select from "antd/es/select";
import clsx from "clsx";
import React, { useMemo } from "react";
import { usePlatforms } from "src/hooks/use-platforms";
import { IPlatform } from "src/types/platform.type";
import { getChainById } from "src/utils/chain.utils";
import { saveLocalStorageData } from "src/utils/storage.utils";
import { getChainsFromUsecase } from "src/utils/wallet.util";
import { supportedChains } from "src/wagmi";
import styled from "styled-components";
import { Chain } from "viem";

const WrapSelectChain = styled(SelectComponent)`
  .ant-select-open {
    width: 300px !important;
  }
  .dark-blue-option {
    width: 300px !important;
  }
`;

const SelectChain = ({
  currentChain,
  setCurrentChain,
  disabled = false,
  currentProject,
}: {
  currentChain: Chain;
  setCurrentChain: (chain: Chain) => void;
  disabled: boolean;
  currentProject: IPlatform;
}) => {
  const chains = getChainsFromUsecase(currentProject.usecases).length
    ? getChainsFromUsecase(currentProject.usecases)
    : supportedChains;
  const Chains = [
    {
      label: "All chains",
      id: 0,
    },
  ].concat(
    chains.map((e: Chain) => {
      return {
        label: e.name,
        id: e.id,
      };
    })
  );
  const onSelectChain = (value: string) => {
    const chainId = Number(value.split("_")[0]);
    if (chainId === 0) {
      setCurrentChain({
        label: "All chains",
        id: 0,
      } as any);
    }
    const chain = getChainById(chainId);
    chain && setCurrentChain(chain);
    saveLocalStorageData("currentChain", JSON.stringify(chain));
  };
  const selectChains = useMemo(() => {
    return Chains?.map((val, i) => ({
      label: (
        <div className="flex items-center gap-[6px] text-[16px] text-white font-medium ml-4 w-[300px]">
          <RenderChainIcon chainId={Number(val.id)} width={22} height={22} />
          {val?.label}
        </div>
      ),
      value: `${val?.id}_${val?.label}`,
    }));
  }, [Chains?.length]);
  return (
    <WrapSelectChain
      bgfill="dark-blue"
      className={clsx(
        "w-full !h-10 !rounded-lg !bg-grey-100 text-[14px] pl-2 "
      )}
      optionsData={selectChains}
      onSelect={onSelectChain}
      defaultValue={currentChain.name}
      value={`${currentChain?.name ?? (currentChain as any).label}`}
      // disabled={disabled}
      width="300px"
    />
  );
};

const SelectProject = ({
  currentProject,
  setCurrentProject,
}: {
  currentProject: IPlatform;
  setCurrentProject: (platform: IPlatform) => void;
}) => {
  const platforms = usePlatforms();
  const onSelectChain = (value: string) => {
    const chainId = Number(value.split("_")[0]);
    const name = value.split("_")[1];

    if (chainId === 0) {
      setCurrentProject({
        name: "All Platform",
        chainId: 0,
      } as any);
    }
    const platform = platforms.find((e) => e.name === name);
    platform && setCurrentProject(platform);
  };
  const selectPlatforms = useMemo(() => {
    return platforms
      ?.concat([
        {
          chainId: 0,
          label: "All platform",
        },
      ] as any)
      .map((val: any, i) => ({
        label: (
          <div className="flex items-center gap-[6px] text-[16px] text-white font-medium ml-4">
            {/* <RenderChainIcon chainId={Number(val.id)} width={22} height={22} /> */}
            {val?.name ?? val.label}
          </div>
        ),
        value: `${val?.chainId}_${val?.name}`,
      }));
  }, [platforms?.length, currentProject]);
  return (
    <SelectComponent
      bgfill="dark-blue"
      className={clsx("w-full !h-10 !rounded-lg !bg-grey-100 text-[14px] pl-2")}
      optionsData={selectPlatforms}
      onSelect={onSelectChain}
      defaultValue={currentProject.name}
      value={`${currentProject?.name ?? (currentProject as any).label}`}
    />
  );
};
export const FilterWallet = ({
  selectedChain,
  setCurrentChain,
  currentProject,
  setCurrentProject,
  keyword,
  setKeyword,
}: any) => {
  const handleChangeKeyword = (e: any) => {
    setKeyword(e.target.value);
  };
  return (
    <div className="mb-3 flex gap-4 pr-0 lg:pr-4 flex-col sm:flex-row ">
      <SearchComponent
        placeholder="Search by NFT ID or account address..."
        className="w-full !bg-grey-900"
        value={keyword}
        onChange={handleChangeKeyword}
      />
    </div>
  );
};
