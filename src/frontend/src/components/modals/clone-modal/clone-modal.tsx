import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { resetModalState } from "@store/modal-service";
import Popover from "antd/lib/popover";
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import { useCreateTBA } from "src/hooks/use-create-wallet";
import { useCurrentOpeningModal } from "src/hooks/use-modal";
import { Wallet } from "src/types/smart-wallet";
import { supportedChains } from "src/wagmi";
import styled from "styled-components";
import { Chain } from "viem/chains";
import { BaseModal } from "../base-modal";

export const WrapPopover = styled(Popover)`
  .ant-popover-content .ant-popover-inner {
    background-color: #222d46 !important;
  }
`;

export function CloneWalletModal() {
  const { chainId } = useAuthSaga();
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };
  const { data } = useCurrentOpeningModal();
  const wallet = data?.data?.wallet as Wallet;
  const platforms = supportedChains.filter(
    (e) => e.id !== Number(wallet.chain_id)
  );
  const defaultCurrentChain =
    platforms.find((e) => e.id === chainId) ?? platforms[0];
  const [currentChain, setCurrentChain] = useState<Chain | null>(
    defaultCurrentChain
  );
  const isDisabled = !currentChain;
  const { handleCreateTBA } = useCreateTBA(data?.callback);
  const onCreateWallet = () => {
    handleCreateTBA(wallet);
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
        {platforms.map((e) => {
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
  }, [platforms]);

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
          Clone wallet{" "}
        </div>
        <WrapPopover
          content={renderListChain}
          placement="bottomRight"
          overlayClassName="no-arrow !p-0 !shadow-popover w-full max-w-[472px]"
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

        <SwitchChainWrapped
          chainId={currentChain?.id ?? chainId}
          action="proceed"
          callback={onCreateWallet}
        >
          <PrimaryButton
            onClick={onCreateWallet}
            className="rounded-lg h-12 w-ful border-none text-md font-medium"
            label="Clone wallet"
            disabled={isDisabled}
          />
        </SwitchChainWrapped>
      </BaseModal>
    </>
  );
}
