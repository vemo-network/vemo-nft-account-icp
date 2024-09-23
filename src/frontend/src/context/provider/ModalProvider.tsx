import { CloneWalletModal } from "@components/modals/clone-modal/clone-modal";
import { CreateTBAModalSuccess } from "@components/modals/clone-modal/clone-success-modal";
import { CreateWalletModal } from "@components/modals/create-wallet-modal/create-wallet-modal";
import { CreateWalletModalSuccess } from "@components/modals/create-wallet-modal/create-wallet-modal-success";
import { DelegateModal } from "@components/modals/delegate-modal/delegate-modal";
import { DelegateModalSuccess } from "@components/modals/delegate-modal/delegate-success-modal";
import { RevokeModal } from "@components/modals/revoke-modal/revoke-modal";
import { RevokeSuccessModal } from "@components/modals/revoke-modal/revoke-success-modal";
import { DepositModal } from "@components/modals/token-modal/deposit-modal";
import { DepositSuccessModal } from "@components/modals/token-modal/deposit-success-modal";
import { WithdrawSuccessModal } from "@components/modals/token-modal/withdraw-success-modal";
import { WithdrawModal } from "@components/modals/token-modal/withdraw-token";
import { ModalName, ModalType } from "@store/modal-service";
import React, { useMemo } from "react";
import { useCurrentOpeningModal } from "src/hooks/use-modal";

export const ModalProvider = () => {
  const { data, isOpened } = useCurrentOpeningModal();
  if (!isOpened || !data) return null;

  const renderModal = () => {
    switch (data.name) {
      case ModalName.CREATE_WALLET:
        if (data.type === ModalType.CREATE) {
          return <CreateWalletModal />;
        }
        if (data.type === ModalType.SUCCESS) {
          return <CreateWalletModalSuccess data={data.data} />;
        }
        break;
      case ModalName.DEPOSIT_TOKEN:
        if (data.type === ModalType.CREATE) {
          return <DepositModal />;
        }
        if (data.type === ModalType.SUCCESS) {
          return <DepositSuccessModal />;
        }
        break;
      case ModalName.WITHDRAW_TOKEN:
        if (data.type === ModalType.CREATE) {
          return <WithdrawModal />;
        }
        if (data.type === ModalType.SUCCESS) {
          return <WithdrawSuccessModal />;
        }
        break;
      case ModalName.CLONE_WALLET:
        if (data.type === ModalType.CREATE) {
          return <CloneWalletModal />;
        }
        if (data.type === ModalType.SUCCESS) {
          return <CreateTBAModalSuccess data={data.data} />;
        }
        break;
        case ModalName.DELEGATE_WALLET:
          if (data.type === ModalType.CREATE) {
            return <DelegateModal />;
          }
          if (data.type === ModalType.SUCCESS) {
            return <DelegateModalSuccess data={data.data} />;
          }
          break;
          case ModalName.REVOKE_WALLET:
          if (data.type === ModalType.CREATE) {
            return <RevokeModal />;
          }
          if (data.type === ModalType.SUCCESS) {
            return <RevokeSuccessModal />;
          }
          break;
      default:
        return null;
    }
    return null;
  };
  return <>{renderModal()}</>;
};
