import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import CopyComponent from "@components/copy-component";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { ModalName, ModalType, resetModalState } from "@store/modal-service";
import Popover from "antd/lib/popover";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import { useCreateTBA } from "src/hooks/use-create-wallet";
import { useRevoke } from "src/hooks/use-delegate";
import { useCurrentOpeningModal, useOpenModal } from "src/hooks/use-modal";
import { Wallet } from "src/types/smart-wallet";
import { getLinkExplorer } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import { getPlatformIcon } from "src/utils/wallet.util";
import styled from "styled-components";
import { BaseCreateModal } from "../base-modal/base-create-modal";

interface IFarmer {
  id: number;
  name: string;
  contractAddress: string;
}

export function RevokeModal() {
  const { chainId } = useAuthSaga();
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };
  const { data } = useCurrentOpeningModal();
  const wallet = data?.data?.wallet as Wallet;
  const nftDelegation = data?.data?.nftDelegation?.collection;
  const platforms: IFarmer[] = [
    {
      id: 1,
      name: "VemoFarmer",
      contractAddress: "",
    },
  ];
  const defaultFarmer = platforms[0];
  const [currentChain, setCurrentChain] = useState<IFarmer | null>(
    defaultFarmer
  );
  const isDisabled = !currentChain;
  const { onRevoke, isPending } = useRevoke(data?.callback);
  const { onOpen } = useOpenModal();

  const handleRevoke = () => {
    // handleCreateTBA(wallet);
    onRevoke(wallet, nftDelegation);
  };
  const tbaAddress = wallet.tba_address;
  const explorerLink = getLinkExplorer(
    wallet.chain_id,
    "address",
    wallet.tba_address
  );
  return (
    <>
      <BaseCreateModal title="Request to release">
        <p className="text-sm font-normal py-2">
          This activates a 30-day Timeout period. For vePENDLE, rewards are
          distributed monthly, so the Timeout acts as a buffer to ensure fair
          reward distribution between you (Owner) and Voter. The revoke request
          will be executed either manually by Voter or automatically after
          Timeout ends, whichever comes first.
        </p>
        <div className="flex relative h-[120px] mb-10 mt-4 rounded-xl z-1 bg-blue-200">
          <div className=" flex justify-end h-[120px] w-[88%] left-0 bg-blue-300 absolute rounded-xl"></div>

          <div className="p-3 rounded-[8px] mb-10 flex relative h-[120px]  bg-dark-200 min-w-[260px] items-center overflow-hidden z-3">
            <ImageComponent
              src="/images/wallet/krystal-bg.svg"
              width={279}
              height={187}
              alt="krystal-bg"
              className="absolute left-0"
            />
            <p className="absolute left-3 font-normal text-[10px] bottom-[0px] text-green-200">
              DELEGATE
            </p>
            <div className="w-[70px] h-[70px] absolute left-0">
              <div className="flex justify-center items-center h-full bg-platform rounded-r-[8px]">
                <ImageComponent
                  src={getPlatformIcon("") ?? ""}
                  width={40}
                  height={50}
                  alt={"farmer"}
                />
              </div>
            </div>
            <div className="flex flex-col px-6 ml-[76px] z-10 relative  ">
              <p className="text-lg truncate leading-[20px]">Vemo</p>
              <div className="flex justify-between text-lg items-center w-full">
                <p className="text-xxs">NFT Account</p>
                <p>#{wallet.token_id}</p>
              </div>
              <div className="flex gap-[10px] items-center">
                <RenderChainIcon
                  chainId={wallet.chain_id}
                  width={18}
                  height={18}
                />
                <div className="!text-xxs flex justify-between items-center text-sub-text w-full">
                  {formattingUtils.centerEllipsizeString(tbaAddress, 5, 4)}
                  <div className="flex">
                    <CopyComponent
                      text={tbaAddress ?? ""}
                      width={20}
                      height={20}
                    />
                    <ImageComponent
                      src="/icons/clone.svg"
                      alt="clone"
                      width={20}
                      height={20}
                      className="cursor-pointer"
                      // onClick={onClone}
                    />
                    <ImageComponent
                      src="/icons/external-link.svg"
                      alt="external-link"
                      width={20}
                      height={20}
                      className="cursor-pointer"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        window.open(explorerLink);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SwitchChainWrapped
          chainId={wallet.chain_id}
          action="proceed"
          callback={handleRevoke}
        >
          <PrimaryButton
            onClick={handleRevoke}
            className="rounded-lg h-12 w-ful border-none text-md font-medium"
            label="Request to release"
            disabled={isDisabled}
            loading={isPending}
          />
        </SwitchChainWrapped>
      </BaseCreateModal>
    </>
  );
}
