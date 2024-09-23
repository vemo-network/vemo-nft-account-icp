import { PrimaryButton } from "@components/buttons/primary-button";
import { ModalName, ModalType } from "@store/modal-service";
import { useCreateWallet } from "src/hooks/use-create-wallet";
import { useOpenModal } from "src/hooks/use-modal";

// import { useCurrentOpeningModal } from "src/hooks/use-modal";
// import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";

export const CreateWallet = ({
  callback,
  onClose,
}: {
  callback: () => void;
  onClose?: any;
}) => {
  // const { handleCreateWallet } = useCreateWallet(callback, onClose );
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
  return (
    <PrimaryButton
      onClick={handleCreateWallet}
      label="Create NFT account"
      className="!w-fit px-8"
    />
  );
};
