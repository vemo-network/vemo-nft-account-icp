import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { BasePopover } from "@components/popover";
import { setSelectChain } from "@store/global";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import { useGlobalData } from "src/hooks/use-config";
import { getChainById } from "src/utils/chain.utils";
import { supportedChains } from "src/wagmi";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { useSwitchChain } from "wagmi";

export const DropdownSelectChain = () => {
  const [isMenu, setIsMenu] = useState(false);
  const handleClickChange = (visible: boolean) => {
    setIsMenu(visible);
  };
  const { chainId, chain, address: wallet } = useAuthSaga();
  const isUnSupportedChain = !supportedChains.find((e) => e.id === chainId);

  const refAccount = useRef(wallet);
  useEffect(() => {
    if (wallet) {
      refAccount.current = wallet;
    }
  }, [wallet]);
  const globalData = useGlobalData();
  const chainSelected =
    globalData.selectChain ?? getChainById(Number(chainId)) ?? mainnet;
  const dispatch = useDispatch();
  const setChainSelected = (chain: Chain) => {
    dispatch(setSelectChain(chain));
  };
  const { switchChain } = useSwitchChain();
  const handleSelectChain = (chain: Chain) => {
    !refAccount.current && setChainSelected(chain);
    refAccount &&
      switchChain({
        chainId: chain.id,
      });
    setIsMenu(false);
  };
  const renderListChain = useMemo(() => {
    return (
      <>
        {supportedChains.map((e) => {
          return (
            <div
              key={e.id}
              className="cursor-pointer hover:bg-hover-menu"
              onClick={() => handleSelectChain(e)}
            >
              <div className=" flex gap-1 px-4 py-[10px]">
                <RenderChainIcon
                  chainId={Number(e.id)}
                  width={22}
                  height={22}
                />
                <span className="text-white ml-1 font-bold text-md">
                  {e.name}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  }, []);
  const currentChain = supportedChains.find((e) => e.id === chain?.id);
  const renderCurrentChain = useMemo(() => {
    if ((isUnSupportedChain && chainId) || (!currentChain && !!chain)) {
      return (
        <div className="flex gap-1 py-2 items-center justify-center">
          <div className="flex gap-2 items-center font-bold text-[16px]">
            <ImageComponent
              // className={clsx("pb-[50%] default-icon")}
              src="/icons/status/warning.svg"
              width={24}
              height={24}
              alt="chevron-right-icon"
            />{" "}
            Switch network
          </div>
        </div>
      );
    }
    return (
      <div className="pt-2 flex gap-1 py-2 items-center">
        <RenderChainIcon
          chainId={Number(chainSelected.id)}
          width={22}
          height={22}
        />
        <span className="text-white ml-1 hidden sm:block font-bold text-[16px]">
          {chainSelected?.name}
        </span>
      </div>
    );
  }, [chainSelected, isUnSupportedChain, chainId, currentChain, chain]);
  return (
    <BasePopover
      content={renderListChain}
      placement="bottomRight"
      overlayClassName="no-arrow !p-0 !shadow-popover"
      overlayInnerStyle={{
        backgroundColor: "#1C1E23",
        padding: "0px",
        transform: "translateY(4px)",
      }}
      open={isMenu}
      onOpenChange={handleClickChange}
      trigger="click"
    >
      <div className="!text-xs h-10 !py-px sm:rounded-[10px] sm:px-3 rounded-full border-none relative px-2  cursor-pointer flex justify-center items-center gap-2">
        <div className="!bg-[#FFFFFF] opacity-5  absolute w-full h-full rounded-full " />
        {renderCurrentChain}

        <div className="sm:block hidden">
          <ImageComponent
            src="/icons/chevron-down-icon.svg"
            width={18}
            height={18}
            alt="chevron-right-icon"
          />
        </div>
      </div>
    </BasePopover>
  );
};
