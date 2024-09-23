import { PrimaryButton } from "@components/buttons/primary-button";
import React from "react";
import { useCloseModal, useCurrentOpeningModal } from "src/hooks/use-modal";
import { formattingUtils } from "src/utils/formatting-utils";
import { BaseModalSuccess } from "../base-modal/base-success-modal";

export const WithdrawSuccessModal = () => {
  const { data } = useCurrentOpeningModal();
  const amount = data?.data?.amount;
  const symbol = data?.data?.symbol;
  const { onClose } = useCloseModal();
  // const handleBackToWallet = () => {onClose};
  return (
    <BaseModalSuccess title="Withdraw">
      <div>
        {formattingUtils.toLocalString(amount)} {symbol} has been transferred to
        your wallet.
        <PrimaryButton
          label="Back to my wallet"
          onClick={onClose}
          className="mt-16"
        />
      </div>
    </BaseModalSuccess>
  );
};
