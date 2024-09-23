import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import { ImageComponent } from "@components/images/render-image";
import { ModalName, ModalType, resetModalState } from "@store/modal-service";
import Popover from "antd/lib/popover";
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import { useDelegationContract, useFarmerConfig } from "src/hooks/use-config";
import { useCreateTBA, useDelegate } from "src/hooks/use-create-wallet";
import { useCurrentOpeningModal, useOpenModal } from "src/hooks/use-modal";
import { Wallet } from "src/types/smart-wallet";
import styled from "styled-components";
import { BaseCreateModal } from "../base-modal/base-create-modal";

const WrapPopover = styled(Popover)`
  .ant-popover-content .ant-popover-inner {
    background-color: #222d46 !important;
  }
`;

interface IFarmer {
  id?: number;
  name: string;
  contractAddress?: string;
  address: string;
}

export function DelegateModal() {
  const { chainId, address } = useAuthSaga();
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };
  const { data } = useCurrentOpeningModal();
  const wallet = data?.data?.wallet as Wallet;
  const platforms = useFarmerConfig();
  const defaultFarmer = platforms
    ? platforms[0]
    : {
        name: "Vemo Voter",
        address: address as any,
        contractAddress: "",
        id: 1,
      };
  const [currentChain, setCurrentChain] = useState<IFarmer | null>(
    defaultFarmer
  );
  const isDisabled = !currentChain;
  const { handleDelegate } = useDelegate(data?.callback);
  const { onOpen } = useOpenModal();
  const delegationContract = useDelegationContract();
  const farmer = useFarmerConfig();
  const onDelegate = () => {
    delegationContract &&
      farmer &&
      handleDelegate(wallet, delegationContract[0], farmer[0]);
    // setTimeout(() => {
    //   onOpen({
    //     data: {
    //       chainId: 1,
    //       project: {
    //         name: "vemo",
    //       },
    //     },
    //     name: ModalName.DELEGATE_WALLET,
    //     type: ModalType.SUCCESS,
    //   });
    // }, 100);
  };
  const [isMenu, setIsMenu] = useState(false);
  const handleSelectFarmer = (e: IFarmer) => {
    setCurrentChain(e);
  };
  const handleClickChange = (visible: boolean) => {
    setIsMenu(visible);
  };

  const renderListChain = useMemo(() => {
    return (
      <>
        {platforms?.map((e) => {
          return (
            <div
              key={e.address}
              className="cursor-pointer hover:bg-grey-700"
              onClick={() => {
                handleSelectFarmer(e);
                setIsMenu(false);
              }}
            >
              <div className=" flex gap-2 px-4 py-[16px]">
                <ImageComponent
                  src={"/icons/vemo-icon.svg"}
                  width={30}
                  height={30}
                  alt="dapp-connecting"
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
      <BaseCreateModal title="Delegate">
        <p className="text-sm font-normal py-2">
          The voter will have the authority to cast votes and harvest rewards on
          Pendle Finance on your behalf. However, they won't be able to perform
          other actions such as transferring or withdrawing your assets.
        </p>
        <p className="text-sm font-normal pt-4">Select the voter</p>
        <WrapPopover
          content={renderListChain}
          placement="bottomRight"
          overlayClassName="no-arrow !p-0 !shadow-popover w-full max-w-[402px]"
          overlayInnerStyle={{
            backgroundColor: "#222d46",
            padding: "0px",
            width: "100%",
          }}
          open={isMenu}
          onOpenChange={handleClickChange}
          trigger="click"
        >
          <div className="!text-xs h-14 !py-px sm:rounded-[10px] sm:px-3 rounded-full border-none !bg-[#222d46] px-2 !hover:!bg-primary-300  cursor-pointer flex items-center gap-2 mb-6 mt-2">
            <div className="pt-2 flex gap-1 py-2 items-center w-full">
              <ImageComponent
                src={"/icons/vemo-icon.svg"}
                width={30}
                height={30}
                alt="dapp-connecting"
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
          chainId={wallet?.chain_id ?? chainId}
          action="proceed"
          callback={onDelegate}
        >
          <PrimaryButton
            onClick={onDelegate}
            className="rounded-lg h-12 w-ful border-none text-md font-medium"
            label="Delegate"
            disabled={isDisabled}
          />
        </SwitchChainWrapped>
      </BaseCreateModal>
    </>
  );
}
