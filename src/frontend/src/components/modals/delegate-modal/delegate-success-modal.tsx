import { PrimaryButton } from "@components/buttons/primary-button";
import CopyComponent from "@components/copy-component";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { resetModalState } from "@store/modal-service";
import { useDispatch } from "react-redux";
import { ChainId } from "src/configs/constants/chain";
import { useViewWalletDetailById } from "src/hooks/use-wallet";
import { Project } from "src/types/collection.type";
import { getLinkExplorer } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import { getPlatformIcon } from "src/utils/wallet.util";
import { BaseModalSuccess } from "../base-modal/base-success-modal";

interface CreateWalletDataProps {
  data: {
    project: Project;
    chainId: ChainId;
    tokenId?: string;
    account?: string;
  };
}

export function DelegateModalSuccess({ data }: CreateWalletDataProps) {
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };

  const { setWallet } = useViewWalletDetailById();
  const { project, tokenId, account } = data;
  const explorerLink = getLinkExplorer(
    data?.chainId ?? project.chainId,
    "address",
    account ?? ""
  );
  const onWalletCreated = () => {
    setWallet({
      tokenId: data.tokenId ?? "",
      tbaAddress: data.account ?? "",
      chainId: data.chainId,
    });
    handleClose();
  };
  const wallet = {
    token_id: data.tokenId,
    chain_id: data.chainId,
  };
  const tbaAddress = data.account;
  return (
    <>
      <BaseModalSuccess title="Delegate">
        <p className="flex flex-col gap-[24px] mb-10">
          Vemo Voter now has permission to cast votes and harvest rewards on
          Pendle Finance on your behalf. The farming rewards will be distributed
          between you and Vemo Voter at a 99.99:0.01 ratio. You have the right
          to revoke this permission at any time.
        </p>
        <div className="flex relative h-[120px] mb-10 rounded-xl z-1 bg-blue-200">
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
        <PrimaryButton
          onClick={onWalletCreated}
          className="rounded-lg h-12 w-ful border-none text-md"
          label=" Back to my NFT account"
        />
      </BaseModalSuccess>
    </>
  );
}
