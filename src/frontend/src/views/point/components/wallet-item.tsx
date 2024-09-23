import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { AvatarIcon } from "@components/jazzicon";
import { ModalName, ModalType } from "@store/modal-service";
import { clsx } from "clsx";
import { capitalize, chain } from "lodash";
import React, { useCallback } from "react";
import { useSelectedChain } from "src/hooks/use-config";
import { useCreateWallet } from "src/hooks/use-create-wallet";
import { useOpenModal } from "src/hooks/use-modal";
import { IOnchainSmartWallet, Wallet } from "src/types/smart-wallet";
import { getChainById } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import styled from "styled-components";
import { signClientSingleton } from "./wallet-detail";

interface IWalletItem {
  wallet: IOnchainSmartWallet | Wallet;
  setWalletSelected: (wallet: IOnchainSmartWallet | Wallet) => void;
  isActive: boolean;
  isCreateItem?: boolean;
  callback?: () => void;
  onClose?: () => void;
  selectedTbaChain: number;
}

const WrapWalletItem = styled.div`
  // &:hover {
  //   background: #254392;
  // }
`;

const WalletItemDetail = ({
  wallet,
  setWallet,
  isActive,
  selectedTbaChain,
}: {
  wallet: IOnchainSmartWallet | Wallet;
  setWallet: (wallet: Wallet | IOnchainSmartWallet) => void;
  isActive: boolean;
  selectedTbaChain: number;
}) => {
  const isDelegated = wallet?.wallet_collection?.isDelegated;
  const nftTag = () => {
    if (isDelegated) {
      return (
        <div className="rounded-xl sm:w-[100px] w-[90px] bg-blue-800 text-center text-sm py-[2px]">
          Delegate
        </div>
      );
    }
  };

  const renderTbas = () => {
    if (!tbas?.length) {
      return null;
    }
    return (
      <div className="flex flex-col cursor-pointer">
        {tbas.map((e) => {
          return (
            <div
              key={`${e.chainId}-${wallet.chain_id}-${wallet.tba_address}`}
              className={clsx(
                "pl-14 flex gap-3 items-center  py-2 hover:bg-primary-500 justify-between",
                isActive && Number(e.chainId) === Number(selectedTbaChain)
                  ? "bg-blue-600"
                  : ""
              )}
              onClick={(elm) => {
                elm.stopPropagation();
                setWallet({
                  ...wallet,
                  tbaChain: e.chainId,
                });
              }}
            >
              <div className="flex gap-3">
                <RenderChainIcon chainId={e.chainId} width={18} height={18} />
                <p className="text-sm">
                  {formattingUtils.centerEllipsizeString(
                    wallet.tba_address,
                    5,
                    4
                  )}
                </p>
              </div>
              <div className="flex gap-2 items-center mr-6">
                <AvatarIcon
                  address={`${wallet.tba_address}`}
                  chainId={e.chainId}
                />
                <div className="w-5">
                  {isActive &&
                    Number(e.chainId) === Number(selectedTbaChain) && (
                      <ImageComponent
                        src="/icons/status/checked.svg"
                        width={20}
                        height={20}
                        alt="checked-icon"
                      />
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const tbas = wallet?.tbas;
  const chainName = capitalize(getChainById(Number(wallet?.chain_id ?? 1))?.name);
  return (
    <div className="flex flex-col  w-full">
      <div className="flex w-full z-10 relative py-3 items-center justify-between px-2 md:px-6">
        <div className="flex gap-3 items-center">
          <RenderChainIcon chainId={wallet.chain_id} width={18} height={18} />

          <p className=" text-base sm:text-lg truncate leading-[20px]">
            {wallet?.wallet_collection?.name?.replace(chainName, "")}
          </p>
          <div className="flex justify-between text-lg items-center">
            {/* <p className="text-xxs">NFT Account</p> */}
            <p>#{wallet.token_id}</p>
          </div>
        </div>
        {nftTag()}
      </div>
      {renderTbas()}
    </div>
  );
};

export const WalletItem = ({
  wallet,
  setWalletSelected,
  isActive,
  isCreateItem = false,
  callback = () => null,
  onClose = () => null,
  selectedTbaChain,
}: IWalletItem) => {
  const selectedChain = useSelectedChain();
  const { onOpen } = useOpenModal();
  const handleCreateWallet = () => {
    onOpen({
      callback,
      name: ModalName.CREATE_WALLET,
      type: ModalType.CREATE,
      data: null,
      onClose,
    });
  };
  const onSelectWallet = async () => {
    if (isCreateItem) {
      return handleCreateWallet();
    }
    if (!isActive) {
      const sessions = signClientSingleton.getSignClient()?.session;
      if (sessions.length > 0) {
        try {
          const currentSession = sessions.getAll()[0];
          // await signClientSingleton.accountChanged(
          //   currentSession.topic,
          //   wallet.tba_address,
          //   chainId.toString()
          // );
        } catch (error) {}
      }
    }
    return setWalletSelected(wallet);
  };

  return (
    <WrapWalletItem
      className={clsx(
        "flex justify-center items-center w-full relative overflow-hidden rounded-[8px] col min-w-[250px] bg-blue-400"
        // wallet?.wallet_collection?.isDelegated ? "bg-dark-200" : "bg-grey-300"
      )}
      // onClick={onSelectWallet}
      // active={isActive ? true : false}
    >
      {!isCreateItem && (
        <>
          {/* <ImageComponent
            src="/images/wallet/krystal-bg.svg"
            width={279}
            height={187}
            alt="krystal-bg"
            className="absolute left-0"
          /> */}
          {/* {wallet?.wallet_collection?.isDelegated && (
            <p className="absolute left-3 font-normal text-[10px] bottom-[0px] text-green-200">
              DELEGATE
            </p>
          )} */}
        </>
      )}
      {isCreateItem ? (
        <>
          {" "}
          <SwitchChainWrapped
            action="create"
            callback={handleCreateWallet}
            chainId={selectedChain.id}
          >
            <div className="flex justify-between w-full mt-0 z-10 relative items-center">
              <PrimaryButton
                label="Create NFT account"
                onClick={onSelectWallet}
              />
            </div>
          </SwitchChainWrapped>
        </>
      ) : (
        <WalletItemDetail
          wallet={wallet}
          setWallet={setWalletSelected}
          isActive={isActive}
          selectedTbaChain={selectedTbaChain}
        />
      )}
    </WrapWalletItem>
  );
};
