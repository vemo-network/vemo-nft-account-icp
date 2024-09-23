import { PrimaryButton } from "@components/buttons/primary-button";
import React from "react";
import { useCloseModal, useCurrentOpeningModal } from "src/hooks/use-modal";
import { formattingUtils } from "src/utils/formatting-utils";
import { BaseModalSuccess } from "../base-modal/base-success-modal";

export const DepositSuccessModal = () => {
  const { data } = useCurrentOpeningModal();
  const amount = data?.data?.amount;
  const symbol = data?.data?.symbol;
  const { onClose } = useCloseModal();
  // const handleBackToWallet = () => {onClose};
  return (
    <BaseModalSuccess title="Deposit">
      <div>
        {formattingUtils.toLocalString(amount)} {symbol} has been deposited to
        your NFT account.
        <PrimaryButton
          label="Back to my NFT account"
          onClick={onClose}
          className="mt-16"
        />
      </div>
    </BaseModalSuccess>
  );
};
