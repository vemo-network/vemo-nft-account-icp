import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import CustomInputNumber from "@components/input/CustomInputnNumber";
import clsx from "clsx";
import { ZeroAddress } from "ethers6";
import React, { useState } from "react";
import { useTokenBalance } from "src/hooks/use-balance";
import { useCurrentOpeningModal } from "src/hooks/use-modal";
import { useWithdrawToken } from "src/hooks/use-withdraw-token";
import { Wallet } from "src/types/smart-wallet";
import { IToken } from "src/types/token.types";
import { formattingUtils } from "src/utils/formatting-utils";
import { getTbaAddress } from "src/utils/wallet.util";
import { BaseCreateModal } from "../base-modal/base-create-modal";
import { SelectToken } from "./component/select-token";

export const WithdrawModal = () => {
  const { data } = useCurrentOpeningModal();
  const tokens = data?.data?.tokens;
  const walletSelected: Wallet = data?.data?.wallet;

  if (!tokens || !walletSelected) return;
  const [currentToken, setCurrentToken] = useState<IToken | null>(null);
  const [amount, setAmount] = useState("");
  const tbaAddress =
    walletSelected.tba_address ??
    getTbaAddress({
      chain_id: walletSelected.chain_id,
      contract_address: walletSelected.contract_address as any,
      token_id: walletSelected?.token_id?.toString(),
    });
  const { balance: tokenBalance, isLoading } = useTokenBalance(
    currentToken?.token_address ?? ZeroAddress,
    tbaAddress ?? ZeroAddress,
    {
      chainId: walletSelected.chain_id,
    }
  );
  const balanceFormatted = formattingUtils.formatUnit(tokenBalance ?? "0");
  const { handleWithdrawToken } = useWithdrawToken(data.callback);
  const onWithdraw = async () => {
    currentToken &&
      (await handleWithdrawToken({
        tokenAddress: currentToken?.token_address,
        amount: amount,
        tbaAddress: tbaAddress,
        symbol: currentToken?.symbol  ?? '',
        decimal: 18,
        walletSelected
      }));
  };
  const onMaxBalance = () => {
    currentToken?.token_address && setAmount(balanceFormatted.toString());
  };
  const inValidData =
    !amount || Number(amount) <= 0 || Number(amount) > Number(balanceFormatted);
  return (
    <BaseCreateModal title={"Withdraw"}>
      <div>
        <p className="text-sm py-1">Select token</p>
        <SelectToken
          tokens={tokens}
          currentToken={currentToken as any}
          setCurrentToken={setCurrentToken}
          placeholder="Select token"
          showSearch
        />
        <p className="text-sm py-2 mt-3">Token amount</p>
        <div className="relative w-full text-xxs mb-10">
          <CustomInputNumber
            className="bg-grey-200 h-10 rounded-[8px]  px-3 text-14px pr-[50px]"
            onChange={(e: any) => {
              if (
                formattingUtils.parseUnit(e?.target?.value) >= tokenBalance &&
                currentToken?.token_address
              ) {
                return setAmount(balanceFormatted);
              }
              setAmount(e.target.value);
            }}
            value={amount}
          />
          <span
            className={clsx(
              "absolute right-[12px] top-[10px]  ",
              currentToken?.token_address
                ? "cursor-pointer"
                : "cursor-not-allowed"
            )}
            onClick={onMaxBalance}
          >
            Max
          </span>
          {currentToken && (
            <p className="italic text-green-100 text-sm text-end mt-1">
              Available:{" "}
              {isLoading
                ? "-"
                : formattingUtils.toLocalString(balanceFormatted)}{" "}
              {currentToken?.symbol}{" "}
            </p>
          )}
        </div>

        <SwitchChainWrapped
          chainId={walletSelected?.chain_id}
          action="withdraw"
        >
          <PrimaryButton
            label="Withdraw"
            onClick={onWithdraw}
            disabled={inValidData}
          />
        </SwitchChainWrapped>
      </div>
    </BaseCreateModal>
  );
};
