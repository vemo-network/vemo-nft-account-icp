import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { resetModalState } from "@store/modal-service";
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthSaga } from "src/hooks/use-auth";
import { useChainConfig } from "src/hooks/use-config";
import { useCreateWallet } from "src/hooks/use-create-wallet";
import { useCurrentOpeningModal } from "src/hooks/use-modal";
import { Collection, IlUseCase, IPlatform } from "src/types/platform.type";
import { getChainsFromUsecase } from "src/utils/wallet.util";
import { supportedChains } from "src/wagmi";
import { Chain } from "viem/chains";
import { BaseModal } from "../base-modal";
import { WrapPopover } from "../clone-modal/clone-modal";
import { Platforms } from "./platforms";
import { SelectAsset } from "./select-asset";
import { SelectChain } from "./select-chain";

interface Props {
  data?: any;
}

export function CreateWalletModal() {
  const { chainId, chain } = useAuthSaga();
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };
  const { isOpened, data } = useCurrentOpeningModal();
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(chain);

  const { handleCreateWallet } = useCreateWallet(data?.callback, data?.onClose);
  const onCreateWallet = () => {
    handleCreateWallet();
  };
  const [isMenu, setIsMenu] = useState(false);
  const handleSelectChain = (e: Chain) => {
    setCurrentChain(e);
  };
  const handleClickChange = (visible: boolean) => {
    setIsMenu(visible);
  };
  const renderListChain = useMemo(() => {
    return (
      <>
        {supportedChains.map((e) => {
          return (
            <div
              key={e.id}
              className="cursor-pointer hover:bg-grey-700"
              onClick={() => {
                handleSelectChain(e);
                setIsMenu(false);
              }}
            >
              <div className=" flex gap-3 px-4 py-[16px]">
                <RenderChainIcon
                  chainId={Number(e.id)}
                  width={32}
                  height={32}
                />
                <span className="text-white ml-1 font-normal text-lg">
                  {e.name}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  }, []);
  return (
    <>
      <BaseModal
        open
        className="!w-[520px] h-[500px] relative"
        onClose={handleClose}
      >
        <ImageComponent
          src="/images/create-modal-icon.png"
          width={220}
          height={260}
          alt="create-modal-icon"
          className="absolute right-[30px] top-[-130px]"
        />
        <div className="text-white text-xxl text-start mb-4 mt-[45px]">
          Create NFT Account
        </div>
        <div className="flex flex-col gap-[24px] mb-10">
          <WrapPopover
            content={renderListChain}
            placement="bottomRight"
            overlayClassName="no-arrow !p-0 !shadow-popover w-full max-w-[360px] sm:max-w-[470px]"
            overlayInnerStyle={{
              backgroundColor: "#222d46",
              padding: "0px",
              width: "100%",
            }}
            open={isMenu}
            onOpenChange={handleClickChange}
            trigger="click"
          >
            <div className="!text-xs h-20 !py-px sm:rounded-[10px] sm:px-3 rounded-full border-none !bg-[#222d46] px-2 !hover:!bg-primary-300  cursor-pointer flex items-center gap-2 my-6">
              <div className="pt-2 flex gap-1 py-2 items-center w-full">
                <RenderChainIcon
                  chainId={Number(currentChain?.id)}
                  width={48}
                  height={48}
                />
                <span className="text-white ml-1 font-normal text-lg">
                  {currentChain?.name}
                </span>
              </div>

              <div className="sm:block hidden">
                <ImageComponent
                  src="/icons/chevron-down-icon.svg"
                  width={18}
                  height={18}
                  alt="chevron-right-icon"
                />
              </div>
            </div>
          </WrapPopover>
          <div className="flex items-center gap-4">
            <ImageComponent
              src="/icons/status/disclaimer.svg"
              width={40}
              height={40}
              alt="disclaimer"
            />
            <div>
              <p className="text-orange-100 italic text-xxs">
                Disclaimer:{" "}
                <span className="text-white">
                  We recommend that users create separate wallet NFTs for each
                  asset to avoid confusion and mistakes while trading on the
                  secondary market
                </span>
              </p>
            </div>
          </div>
        </div>
        <SwitchChainWrapped
          chainId={currentChain?.id ?? chainId}
          action="proceed"
        >
          <PrimaryButton
            onClick={onCreateWallet}
            className="rounded-lg h-12 w-ful border-none text-md"
            label="Create NFT account"
          />
        </SwitchChainWrapped>
      </BaseModal>
    </>
  );
}
