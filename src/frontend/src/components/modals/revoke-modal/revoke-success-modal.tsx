import { PrimaryButton } from "@components/buttons/primary-button";
import React from "react";
import { useCloseModal, useCurrentOpeningModal } from "src/hooks/use-modal";
import { formattingUtils } from "src/utils/formatting-utils";
import { BaseModalSuccess } from "../base-modal/base-success-modal";

export const RevokeSuccessModal = () => {
  const { onClose } = useCloseModal();
  // const handleBackToWallet = () => {onClose};
  return (
    <BaseModalSuccess title="Requested">
      <div>
        <p>
          Your request has been sent successfully. The delegated will have
          maximum of 30 days to release the delegation.
        </p>
        <PrimaryButton
          label="Back to my wallet"
          onClick={onClose}
          className="mt-16"
        />
      </div>
    </BaseModalSuccess>
  );
};
