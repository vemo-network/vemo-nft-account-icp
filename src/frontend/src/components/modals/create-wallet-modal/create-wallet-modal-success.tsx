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
import { BaseModal } from "../base-modal";

interface CreateWalletDataProps {
  data: {
    project: Project;
    chainId: ChainId;
    tokenId?: string;
    account?: string;
    callback?: any;
  };
}

export function CreateWalletModalSuccess({ data }: CreateWalletDataProps) {
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };

  const { setWallet } = useViewWalletDetailById();
  const { project, tokenId, account, callback } = data;
  const explorerLink = getLinkExplorer(
    data?.chainId ?? project.chainId,
    "address",
    account ?? ""
  );
  console.log("callback :>> ", callback);

  const onWalletCreated = () => {
    setWallet({
      tokenId: data.tokenId ?? "",
      tbaAddress: data.account ?? "",
      chainId: data.chainId,
    });
    handleClose();
    callback && callback();
  };
  return (
    <>
      <BaseModal
        open
        className="!w-[540px] h-[500px] relative"
        onClose={handleClose}
        isNeedCloseIcon={true}
      >
        <ImageComponent
          src="/icons/status/create-wallet-success.svg"
          width={186}
          height={260}
          alt="create-modal-icon"
          className="absolute right-[30px] top-[-130px]"
        />
        <div className="text-white !text-xxl text-start mb-4 mt-[100px] font-medium">
          Created{" "}
          <span className="text-green-100 !text-xxl"> Successfully</span>
        </div>
        <p className="flex flex-col gap-[24px] mb-10">
          Now you can connect with D-app using this wallet and all the
          information regarding points or token balance can be seen on Vemo as
          well.
        </p>
        <div className="p-3 bg-grey-200 rounded-[8px] mb-10">
          <div className="flex gap-4 items-center">
            <ImageComponent
              src={"/icons/vemo-icon.svg"}
              width={24}
              height={24}
              alt={project.name}
              className="h-7"
              // httpLink
            />
            <p className="font-semibold">
              {project.name} #{tokenId}
            </p>
          </div>
          <div className="flex gap-[24px] items-center mt-4">
            <RenderChainIcon chainId={data.chainId} width={22} height={22} />
            <div className="!text-sm flex justify-between w-full">
              <p className="text-sm lg:block hidden">{account}</p>
              <p className="text-sm block lg:hidden">
                {" "}
                {formattingUtils.centerEllipsizeString(account, 9, 9)}
              </p>
              <div className="flex">
                <CopyComponent text={account} width={22} height={22} />
                <ImageComponent
                  src="/icons/external-link.svg"
                  alt="external-link"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                  onClick={() => window.open(explorerLink)}
                />
              </div>
            </div>
          </div>
        </div>
        <PrimaryButton
          onClick={onWalletCreated}
          className="rounded-lg h-12 w-ful border-none text-md"
          label="View my wallet detail"
        />
      </BaseModal>
    </>
  );
}
