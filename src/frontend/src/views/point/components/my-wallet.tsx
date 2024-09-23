import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import { ImageComponent } from "@components/images/render-image";
import { LoadingAnimation } from "@components/loading-animation";
import { EmptyState } from "@components/state/empty-state";
import { ModalName, ModalType } from "@store/modal-service";
import { clsx } from "clsx";
import React, { useMemo, useState } from "react";
import { useAuthSaga } from "src/hooks/use-auth";
import { useSelectedChain } from "src/hooks/use-config";
import { useOpenModal } from "src/hooks/use-modal";
import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";
import { useSearchWallet } from "src/hooks/use-search-wallet";
import { useAllTBAs, useWalletDetail } from "src/hooks/use-wallet";
import { IPlatform } from "src/types/platform.type";
import { IOnchainSmartWallet, Wallet } from "src/types/smart-wallet";
import { getCurrentFilterChain } from "src/utils/chain.utils";
import styled from "styled-components";
import { Chain, isAddress, maxInt256 } from "viem";
import { CreateWallet } from "./create-wallet";
import SelectAccount from "./detail-smartwallet-connected";
import { FilterWallet } from "./filter-wallet";
import { WalletDetail } from "./wallet-detail";
import { WalletItem } from "./wallet-item";

let init: any = "";
// grid-template-columns: ${({ length }) =>
//   `repeat(${Math.round(length / 2)}, 265px)`};
const WrapListWallet = styled.div<{ length: number }>`
  .grid-container {
    // display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 12px;
    padding-bottom: 10px;
    max-height: 400px;
  }
  .col {
    // width: 240px;
    margin-top: 12px;
  }
  // .left {
  //   position: sticky;
  //   left: 0;
  //   z-index: 999;
  //   background: lightgray;
  // }
`;

export const MyWallet = ({
  smartWallets,
  callback,
  isLoading,
  allWallets,
  loadingAllWallet,
}: {
  smartWallets: Wallet[] | IOnchainSmartWallet[] | undefined;
  callback: () => void;
  isLoading: boolean;
  allWallets: Wallet[] | undefined;
  loadingAllWallet: boolean;
}) => {
  // console.log(
  //   "loadingAllWallet :>> ",
  //   loadingAllWallet,
  //   smartWallets,
  //   isLoading
  // );
  const { address } = useAuthSaga();
  const currentChain = useSelectedChain();
  const [selectedChain, setCurrentChain] = useState<
    | Chain
    | {
        label: "All chains";
        id: 0;
      }
  >(getCurrentFilterChain());
  const { walletSelected, setWalletSelected } = useWalletDetail();
  const [projectSelected, setProjectSelected] = useState<
    | IPlatform
    | {
        name: "All platforms";
        chainId: 0;
      }
  >({
    name: "All platforms",
    chainId: 0,
  });

  const initWallet = (walletAddress: string) => {
    if (isAddress(walletAddress)) {
      const wallet = smartWallets?.find(
        (e) => e.tba_address?.toLowerCase() === walletAddress?.toLowerCase()
      );
      wallet && setWalletSelected(wallet);
    }
  };
  useMemo(() => {
    if (smartWallets?.length && init !== address) {
      setWalletSelected(smartWallets[0]);
      init = address;
    }
    // if (
    //   walletSelected &&
    //   walletSelected?.owner_address?.toLowerCase() !== address?.toLowerCase() &&
    //   !!address
    // ) {
    //   setWalletSelected(null);
    // }
  }, [!!smartWallets?.length, address]);
  // const { data } = useReadContract({
  //   abi: TbaAbi,
  //   address: walletSelected?.tba_address,
  //   functionName: "delegates",
  //   args: [ZeroAddress, maxInt256],
  //   chainId: walletSelected?.chain_id,
  // });
  // console.log("maxInt256 :>> ", data);
  const { onOpenModal } = useOpenModalCreate();

  const [keyword, setKeyword] = useState<string>("");
  const { handleSearchWallet } = useSearchWallet();
  useMemo(() => {
    handleSearchWallet({
      // keyword,
      chain_id: selectedChain?.id || 0,
      platform_id: (projectSelected as any)?.id || 0,
    });
  }, [selectedChain, projectSelected]);
  const { data: tbas } = useAllTBAs();
  const tbaWallet = smartWallets?.map((e, index) => {
    return {
      ...e,
      tbas:
        tbas[index] && !e.wallet_collection.isDelegated
          ? tbas[index].concat(e)
          : [e],
    };
  });
  const filterWallets = useMemo(() => {
    const smartWalletUpdated = tbaWallet?.length ? tbaWallet : smartWallets;
    if (!keyword && selectedChain.id === 0) {
      return smartWalletUpdated;
    }
    if (selectedChain.id !== 0 && !keyword) {
      return smartWalletUpdated?.filter(
        (wallet) => Number(wallet.chain_id) === selectedChain.id
      );
    }
    // if(keyword && !keyword.startsWith('0x')){
    //   return smartWalletUpdated
    // }
    return smartWalletUpdated?.filter(
      (wallet) =>
        wallet.tba_address?.toLowerCase().includes(keyword.toLowerCase()) ||
        Number(wallet.token_id) === Number(keyword)
    );
  }, [smartWallets, keyword, selectedChain, tbaWallet]);
  const handleViewAll = () => {
    setKeyword("");
    setCurrentChain({
      label: "All chains",
      id: 0,
    });
  };
  const [isOpen, setIsOpen] = useState(false);
  const handleCollapseChange = (isOpen: boolean) => {
    const smartWalletConnected = document.getElementById(
      "smart-wallet-connected"
    );
    const walletDetailElement = document.getElementById("wallet-detail");
    if (walletDetailElement) {
      if (isOpen) {
        walletDetailElement.classList.add("hidden");
        smartWalletConnected && smartWalletConnected.classList.add("hidden");
      } else {
        walletDetailElement.classList.remove("hidden");
        smartWalletConnected && smartWalletConnected.classList.remove("hidden");
      }
    }
    setIsOpen(!!Number(isOpen));
  };
  const handleSetWalletSelected = (wallet: Wallet | IOnchainSmartWallet) => {
    setWalletSelected(wallet);
    handleCollapseChange(false);
  };
  const { onOpen } = useOpenModal();
  const openCreateWallet = () => {
    onOpen({
      callback: callback,
      name: ModalName.CREATE_WALLET,
      type: ModalType.CREATE,
      data: null,
      onClose: () => handleCollapseChange(false),
    });
  };

  return (
    <div className={clsx(" text-xl font-medium  mt-3 relative w-full pb-10")}>
      <div className="flex justify-center items-center w-full py-3">
        NFT Account
      </div>
      <div className="flex justify-center w-full min-h-[50vh] relative">
        {(loadingAllWallet || isLoading) && address && !smartWallets?.length ? (
          <div className="flex flex-col h-full items-center justify-center absolute">
            <LoadingAnimation />
            <p className="text-sm text-center">
              Syncing data for the first time in a while... This may take a
              moment.
            </p>
          </div>
        ) : (
          <>
            {" "}
            {address && !!smartWallets?.length ? (
              <div
                className="w-full flex gap-4 mt-6  flex-col h-fit lg:h-auto"
                id="list-smart-wallet"
              >
                <SelectAccount
                  wallet={walletSelected as any}
                  setIsCollapseOpen={handleCollapseChange}
                  isOpen={isOpen}
                >
                  {/*  */}
                  <div className="w-full  flex flex-col z-100 relative">
                    <div className="flex justify-between w-full p-4 lg:p-6">
                      <p>Select NFT account</p>
                      <ImageComponent
                        src="/icons/chevron-down-up.svg"
                        width={24}
                        height={24}
                        alt="close-icon"
                        className="cursor-pointer"
                        onClick={() => handleCollapseChange(false)}
                      />
                    </div>
                    <div className="px-4">
                      <FilterWallet
                        selectedChain={selectedChain}
                        setCurrentChain={setCurrentChain}
                        currentProject={projectSelected}
                        setCurrentProject={setProjectSelected}
                        keyword={keyword}
                        setKeyword={setKeyword}
                      />
                    </div>
                    {isLoading && !filterWallets?.length ? (
                      <div className="flex justify-center items-center h-full">
                        <LoadingAnimation />
                      </div>
                    ) : (
                      <>
                        {" "}
                        {filterWallets?.length ? (
                          <>
                            {" "}
                            <div className="lg:grid grid-cols-1  gap-4  max-h-[400px] overflow-auto hidden px-6">
                              {filterWallets?.map((e) => (
                                <WalletItem
                                  key={`smart-wallet-${e.contract_address}-${e.token_id}-${e.chain_id}`}
                                  wallet={e}
                                  setWalletSelected={handleSetWalletSelected}
                                  isActive={
                                    walletSelected?.token_id === e.token_id &&
                                    walletSelected?.tba_address?.toLowerCase() ===
                                      e?.tba_address?.toLowerCase() &&
                                    walletSelected?.chain_id === e?.chain_id &&
                                    walletSelected?.wallet_collection
                                      .isDelegated ===
                                      e.wallet_collection.isDelegated
                                  }
                                  selectedTbaChain={
                                    walletSelected?.tbaChain ?? 1
                                  }
                                />
                              ))}
                            </div>
                            <div className="mt-6 hidden lg:flex">
                              <WalletItem
                                key={`smart-wallet-create-item`}
                                wallet={null as any}
                                setWalletSelected={handleSetWalletSelected}
                                isActive={false}
                                isCreateItem={true}
                                callback={callback}
                                onClose={() => handleCollapseChange(false)}
                                selectedTbaChain={walletSelected?.tbaChain ?? 1}
                              />
                            </div>
                          </>
                        ) : (
                          <div className=" mt-20 justify-center items-center lg:flex flex-col gap-3 hidden">
                            <EmptyState title="No search results" />
                            <PrimaryButton
                              label="View all wallets"
                              onClick={handleViewAll}
                              className="max-w-[200px]"
                            />
                          </div>
                        )}
                        <WrapListWallet
                          length={filterWallets?.length ?? 0}
                          className="block lg:hidden "
                        >
                          {filterWallets?.length ? (
                            <div className="grid-container px-4">
                              {filterWallets.map((e) => (
                                <WalletItem
                                  key={`smart-wallet-${e.contract_address}-${e.token_id}-${e.chain_id}`}
                                  wallet={e}
                                  setWalletSelected={handleSetWalletSelected}
                                  isActive={
                                    walletSelected?.token_id === e.token_id &&
                                    walletSelected?.contract_address?.toLowerCase() ===
                                      e?.contract_address?.toLowerCase() &&
                                    walletSelected.chain_id === e.chain_id
                                  }
                                  selectedTbaChain={
                                    walletSelected?.tbaChain ?? 1
                                  }
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex w-full h-full py-3 justify-center flex-col items-center gap-2">
                              <EmptyState title="No search results" />
                              <PrimaryButton
                                label="View all wallets"
                                onClick={handleViewAll}
                                className="max-w-[200px]"
                              />{" "}
                            </div>
                          )}
                          <div className="flex items-center justify-between relative w-full mt-5">
                            <SwitchChainWrapped
                              action="create"
                              callback={openCreateWallet}
                              chainId={currentChain?.id}
                            >
                              <PrimaryButton
                                onClick={openCreateWallet}
                                label="Create NFT account"
                              />
                            </SwitchChainWrapped>
                          </div>
                        </WrapListWallet>
                      </>
                    )}
                  </div>
                </SelectAccount>
                <div className={"mt-6 sm:mt-0"}>
                  <WalletDetail
                    wallet_selected={walletSelected}
                    initWallet={initWallet}
                    openSelectAccount={() => handleCollapseChange(true)}
                    setWalletSelected = {(wallet: any) => setWalletSelected(wallet)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center flex-col gap-2">
                <EmptyState title="You do not have any NFT accounts" />
                <CreateWallet
                  callback={callback}
                  onClose={() => handleCollapseChange(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
