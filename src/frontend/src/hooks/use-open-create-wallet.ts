import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ModalName, ModalType } from "@store/modal-service";
import { useCallback } from "react";
import { useAuthSaga } from "./use-auth";
import { useOpenModal } from "./use-modal";

export const useOpenModalCreate = () => {
  const { address } = useAuthSaga();
  const { openConnectModal } = useConnectModal();
  const { onOpen } = useOpenModal();

  const onOpenModal = useCallback(
    (
      callback: () => void,
      data = {},
      name = ModalName.CREATE_WALLET,
      type = ModalType.CREATE
    ) => {
      if (!address && openConnectModal) {
        return openConnectModal();
      }
      onOpen({
        data,
        name,
        type,
        // type: ModalType.SUCCESS,
        callback,
      });
    },
    [address, openConnectModal]
  );
  return { onOpenModal };
};
