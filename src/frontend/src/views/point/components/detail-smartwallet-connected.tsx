import { PrimaryButton } from "@components/buttons/primary-button";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { SearchComponent } from "@components/search-component";
import jazzicon from "@metamask/jazzicon";
import { ModalName, ModalType } from "@store/modal-service";
import Collapse from "antd/lib/collapse";
import clsx from "clsx";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";
import { Wallet } from "src/types/smart-wallet";
import { getChainById } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import { getSeedJazzIcon } from "src/utils/wallet.util";
import styled from "styled-components";
import { Chain } from "viem";

const WrappedCollapse = styled(Collapse)<{ isOpen: boolean }>`
  .ant-collapse-header {
    display: ${({ isOpen }) => (isOpen ? "none" : "flex")};
    height: 80px;
    align-items: center;
    @media (max-width: 600px) {
      height: 150px;
    }
  }
  .ant-collapse-content {
    background: #1d2a48 !important;
  }
`;

const DetailSmartWalletConnected = ({
  wallet,
  setContentType,
  onClose,
}: {
  wallet: Wallet;
  setContentType: (type: "account" | "network") => void;
  onClose: () => void;
}) => {
  const tbaAddress = wallet?.tba_address;
  const isDelegate = wallet?.wallet_collection?.isDelegated;
  const selectedChain = getChainById(
    Number(wallet?.tbaChain ?? wallet?.chain_id)
  );
  const avatarRef = useRef(null);
  useEffect(() => {
    const element: any = avatarRef.current;
    if (element && tbaAddress) {
      const icon = jazzicon(26, getSeedJazzIcon(tbaAddress)); //generates a size 20 icon
      if (element?.firstChild) {
        element?.removeChild(element?.firstChild);
      }
      element?.appendChild(icon);
    }
  }, [tbaAddress, avatarRef]);
  return (
    <>
      {/* <div
        className=" justify-center items-center w-full hidden"
        id="nft-account-label"
      >
        NFT Account
      </div> */}
      <div
        className="px-2 lg:px-4 rounded-[10px] flex items-center gap-4 justify-between flex-col sm:flex-row z-100 relative"
        id="smart-wallet-connected"
      >
        <div
          className=" bg-primary-500  h-[60px] px-4 rounded-xl w-full sm:w-[70%] justify-between flex items-center"
          onClick={() => setContentType("account")}
        >
          {wallet && (
            <div className="flex gap-3 items-center ">
              {avatarRef && (
                <div
                  ref={avatarRef}
                  className="flex items-center border-[1px] border-blue-700 p-[2px] rounded-[50%]"
                />
              )}
              <p> {formattingUtils.centerEllipsizeString(tbaAddress, 5, 4)}</p>
              <p className="text-blue-900 mr-2">#{wallet?.token_id}</p>
            </div>
          )}
          {!wallet && <p>Select NFT account</p>}
          <div className="flex gap-3 items-center">
            {isDelegate && (
              <div className="rounded-xl w-[100px] bg-blue-800 text-center text-sm py-[2px]">
                Delegate
              </div>
            )}
            <ImageComponent
              src="/icons/chevron-down-icon.svg"
              width={24}
              height={24}
              alt="close-icon-chain"
              className="cursor-pointer"
            />
          </div>
        </div>
        <div
          className={clsx(
            " bg-primary-500 p-4 rounded-xl w-full sm:w-[40%] flex gap-3 items-center justify-between ",
            isDelegate || !wallet ? "pointer-events-none" : ""
          )}
          onClick={() => setContentType("network")}
        >
          <div className="flex gap-3 items-center w-[85%]">
            {selectedChain && (
              <RenderChainIcon
                chainId={selectedChain.id}
                width={20}
                height={20}
              />
            )}{" "}
            <p className="truncate ">
              {selectedChain?.name ?? "Select network"}
            </p>
          </div>
          {!isDelegate && !!wallet && (
            <ImageComponent
              src="/icons/chevron-down-icon.svg"
              width={24}
              height={24}
              alt="close-icon-chain"
              className="cursor-pointer"
            />
          )}
        </div>
      </div>
    </>
  );
};

const SelectChain = ({
  wallet,
  onClose,
}: {
  wallet: Wallet;
  onClose: () => void;
}) => {
  const [keyword, setKeyword] = useState("");
  const tbas = wallet?.tbas;
  const listChain = tbas?.length
    ? [getChainById(wallet?.chain_id)].concat(
        tbas.map((e) => {
          return getChainById(e.chainId);
        })
      )
    : [getChainById(wallet?.chain_id)];
  const item = (chain?: Chain) => {
    if (!chain) {
      return null;
    }
    return (
      <div
        className="flex gap-3 items-center px-4 py-2 bg-blue-400 mt-2 hover:bg-primary-500 rounded-lg"
        key={chain.id}
      >
        <RenderChainIcon chainId={chain.id} width={20} height={20} />
        <p>{chain.name}</p>
      </div>
    );
  };
  const filterListChain = useMemo(() => {
    if (!keyword) {
      return listChain;
    }
    return listChain.filter((chain) =>
      chain?.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [listChain, tbas]);
  const { onOpenModal } = useOpenModalCreate();
  const onClone = useCallback(() => {
    onOpenModal(
      () => null,
      {
        wallet,
      },
      ModalName.CLONE_WALLET,
      ModalType.CREATE
    );
  }, [wallet]);
  return (
    <div className={clsx("p-4")}>
      <div className="flex justify-between w-full">
        <p>Select Account Network</p>
        <ImageComponent
          src="/icons/chevron-down-up.svg"
          width={24}
          height={24}
          alt="close-icon"
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>

      <SearchComponent
        placeholder="Search by Network name"
        className="w-full !bg-[#0f1934] h-10 mt-4"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className="min-h-[200px]">
        {_.uniqBy(filterListChain, "chainId").map(item)}
      </div>
      <div className="mt-6">
        <PrimaryButton label="Deploy on other network" onClick={onClone} />
      </div>
    </div>
  );
};
const SelectAccount = ({
  wallet,
  children,
  setIsCollapseOpen,
  isOpen,
}: {
  wallet: Wallet;
  children: any;
  setIsCollapseOpen: (isOpen: boolean) => void;
  isOpen: boolean; // default false to close the collapse panel
}) => {
  const [contentType, setContentType] = useState<"account" | "network">(
    "account"
  );

  return (
    <WrappedCollapse
      isOpen={isOpen}
      // accordion

      items={[
        {
          key: "1",
          children:
            contentType === "account" ? (
              children
            ) : (
              <SelectChain
                wallet={wallet}
                onClose={() => setIsCollapseOpen(false)}
              />
            ),
          label: (
            <div className=" relative" id="label-smart-wallet-connected">
              {/* {wallet && ( */}
              <DetailSmartWalletConnected
                wallet={wallet}
                setContentType={(type) => {
                  setContentType(type);
                  setIsCollapseOpen(!isOpen);
                }}
                onClose={() => setIsCollapseOpen(false)}
              />
              {/* )} */}
            </div>
          ),
        },
      ]}
      // onChange={(key) => {
      //   setIsCollapseOpen(!!key.length);
      // }}
      expandIcon={() => null}
      activeKey={Number(isOpen)}
    />
  );
};
export default SelectAccount;
