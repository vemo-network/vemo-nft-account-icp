import { PrimaryButton } from "@components/buttons/primary-button";
import { ImageComponent } from "@components/images/render-image";
import { ModalName, ModalType } from "@store/modal-service";
import { removeWallet, setWallet } from "@store/wallet";
import { Skeleton } from "antd/lib";
import clsx from "clsx";
import { ZeroAddress } from "ethers6";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAuthSaga } from "src/hooks/use-auth";
import { useFarmerConfig } from "src/hooks/use-config";
import {
  useDelegate,
  useGetDelegate,
  useIsDelegated,
  useRelease,
  useRevokeTimeout,
} from "src/hooks/use-delegate";
import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";
import { IOnchainSmartWallet, Wallet } from "src/types/smart-wallet";
import { getLinkExplorer } from "src/utils/chain.utils";
import {
  formatTimeStampToDate,
  formattingUtils,
  getTimeToExpired,
} from "src/utils/formatting-utils";
import { erc721Abi } from "viem";
import { useDisconnect, useReadContract, useSwitchChain } from "wagmi";

export const WalletDelegate = ({
  wallet,
  openSelectAccount,
  setWalletSelected,
}: {
  wallet: Wallet | IOnchainSmartWallet;
  openSelectAccount: () => void;
  setWalletSelected: (wallet: any) => void;
}) => {
  const { address, chainId } = useAuthSaga();
  const { onOpenModal } = useOpenModalCreate();
  const farmerConfig = useFarmerConfig();
  const isDelegateNft = wallet.wallet_collection?.isDelegated;
  const nftAddress = wallet.wallet_collection?.isDelegated
    ? wallet.wallet_collection?.issuer
    : wallet.wallet_collection?.contractAddress;
  const { data: accountOwner } = useReadContract({
    abi: erc721Abi,
    address: (nftAddress as any) ?? ZeroAddress,
    functionName: "ownerOf",
    args: [BigInt(wallet.token_id)],
    chainId: wallet.chain_id,
  });
  const {
    data: delegationNfts,
    isLoading,
    refetch: refetchGetDelegate,
  } = useGetDelegate(wallet);

  const data = delegationNfts && delegationNfts[0];
  const isNeedSetDelegate = data?.address;
  const farmerAddress = isDelegateNft ? accountOwner : data?.address;
  const explorerLink = getLinkExplorer(
    wallet.chain_id,
    "address",
    farmerAddress ?? ""
  );
  const dispatch = useDispatch();
  const handleCallbackRelease = () => {
    dispatch(
      removeWallet({
        from: address,
        to: ZeroAddress,
        token_id: wallet.token_id,
        contract_address: wallet.wallet_collection?.contractAddress,
        owner_address: ZeroAddress,
        chainId: wallet.chain_id,
        wallet_collection: wallet.wallet_collection,
        tba_address: wallet.tba_address,
      })
    );
    openSelectAccount();
    setWalletSelected(null);
  };
  // if(!farmerConfig){
  //   return null
  // }
  const { onRelease, isPending: pendingRelease } = useRelease(
    handleCallbackRelease
  );
  const onRevoke = useCallback(() => {
    onOpenModal(
      () => null,
      { wallet, nftDelegation: data },
      ModalName.REVOKE_WALLET,
      ModalType.CREATE
    );
  }, [wallet, data]);
  const { switchChainAsync } = useSwitchChain();
  const handleRelease = useCallback(async () => {
    // return handleCallbackRelease()
    if (Number(chainId) !== Number(wallet.chain_id)) {
      return await switchChainAsync({
        chainId: Number(wallet.chain_id),
      }).then((res) => {
        if (res && data?.collection) {
          onRelease(wallet, data.collection);
        }
      });
    }
    return data?.collection && onRelease(wallet, data.collection);
  }, [data, switchChainAsync, onRelease]);
  const { setDelegate, isPending, delegated, setDelegated } =
    useDelegate(wallet);
  const handleSetDelegate = () => {
    data?.address &&
      data?.collection?.contractAddress &&
      setDelegate(data.collection?.contractAddress as any);
  };
  // const { data: isDelegate } = useIsDelegated(wallet);
  const isDelegate = isNeedSetDelegate;
  const isDelegated = isDelegate ?? delegated;
  const { data: revokeTime, isLoading: loadingRevokeTime } = useRevokeTimeout(
    data?.collection!,
    wallet
  );

  const remainingDays = getTimeToExpired(Number(revokeTime) * 1000);

  const onDelegate = useCallback(() => {
    onOpenModal(
      () => {
        // refetch && refetch();
        refetchGetDelegate && refetchGetDelegate();
      },
      { wallet },
      ModalName.DELEGATE_WALLET,
      ModalType.CREATE
    );
  }, [wallet]);
  const formatRevokeTime = formatTimeStampToDate(
    Number(revokeTime ?? 0),
    "DD/MM/YYYY HH:mm:ss "
  );
  const isDelegationNFT = wallet.wallet_collection?.isDelegated;
  const renderDelegateDetail = () => {
    if (isLoading || loadingRevokeTime) {
      // Skeleton for loading state
      return (
        <Skeleton.Input
          size="large"
          className="w-full py-3"
          style={{
            background: "#353B49",
            borderRadius: "8px",
            padding: "12px",
            border: "none",
            cursor: "pointer",
          }}
        />
      );
    }
    if (isDelegated) {
      return (
        <div className="flex gap-2 py-3 flex-col sm:flex-row">
          <div className="font-normal text-sm rounded-md h-10 flex  w-full border-grey-800 border-[2px] items-center gap-3">
            <div
              className={clsx(
                "flex gap-3 items-center  ml-2 mr-3 font-semibold !text-sm ",
                !isDelegationNFT ? "w-full justify-between" : ""
              )}
            >
              <div className="flex gap-3 items-center">
                <ImageComponent
                  src={"/icons/vemo-icon.svg"}
                  width={24}
                  height={24}
                  alt="dapp-connecting"
                />
                <p className="text-sm">{data?.collection?.name}</p>
                <p className="text-sm">
                  {`(${formattingUtils.centerEllipsizeString(
                    farmerAddress,
                    5,
                    4
                  )})`}
                </p>
                <ImageComponent
                  src="/icons/external-link.svg"
                  alt="external-link"
                  width={16}
                  height={16}
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    window.open(explorerLink);
                  }}
                />
              </div>
              {!!revokeTime && (
                <div className="flex gap-3  items-center">
                  {
                    <p className="text-[14px] font-normal text-orange-100">
                      Expired in {remainingDays} days
                    </p>
                  }
                </div>
              )}
            </div>
          </div>
          {
            <>
              {isDelegationNFT ? (
                <PrimaryButton
                  label="Release"
                  onClick={handleRelease}
                  className="!h-10 w-full sm:max-w-[100px] font-normal"
                  loading={pendingRelease}
                />
              ) : (
                <>
                  {!revokeTime && (
                    <PrimaryButton
                      label="Request to release"
                      onClick={onRevoke}
                      className="!h-10 w-full sm:max-w-[150px] font-normal"
                    />
                  )}
                </>
              )}
            </>
          }
        </div>
      );
    }
    return (
      <div className="flex  gap-2 py-3 flex-col sm:flex-row">
        <div className="font-normal text-[12px] sm:text-sm rounded-md h-10 flex justify-center w-full border-grey-800 border-[2px] items-center">
          You have not delegated your vePENDLE to any voter yet.
        </div>

        <PrimaryButton
          label="Delegate"
          onClick={onDelegate}
          className="!h-10 w-full sm:max-w-[100px] font-normal"
        />
      </div>
    );
  };
  return (
    <div>
      <p
        className={clsx(
          "block  relative whitespace-nowrap leading-[24px] pt-3"
        )}
      >
        {isDelegateNft ? "Delegation" : "Delegate"}{" "}
      </p>
      {renderDelegateDetail()}
    </div>
  );
};
