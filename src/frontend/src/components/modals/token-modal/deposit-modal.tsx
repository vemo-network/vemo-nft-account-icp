import { ApprovedCurrencyCheck } from "@components/buttons/ApprovedCurrencyCheck";
import { PrimaryButton } from "@components/buttons/primary-button";
import { SwitchChainWrapped } from "@components/buttons/wrap-switch-chain";
import CustomInputNumber from "@components/input/CustomInputnNumber";
import clsx from "clsx";
import { ZeroAddress } from "ethers6";
import React, { useState } from "react";
import { useApproveCurrency } from "src/hooks/use-approve-currency";
import { useAuthSaga } from "src/hooks/use-auth";
import { useTokenBalance } from "src/hooks/use-balance";
import { useConnectedChainConfig } from "src/hooks/use-config";
import { useDepositToken } from "src/hooks/use-deposit-token";
import { useCurrentOpeningModal } from "src/hooks/use-modal";
import { Wallet } from "src/types/smart-wallet";
import { IToken } from "src/types/token.types";
import { formattingUtils } from "src/utils/formatting-utils";
import { getTbaAddress } from "src/utils/wallet.util";
import { Address } from "viem";
import { BaseCreateModal } from "../base-modal/base-create-modal";
import { SelectToken } from "./component/select-token";
import { useBalances } from "src/hooks/use-tokens";

export const DepositModal = () => {
  const { data } = useCurrentOpeningModal();
  // const tokens = data?.data?.tokens;
  const { address } = useAuthSaga();

  const walletSelected: Wallet = data?.data?.wallet;
  const { balances: tokens } = useBalances(
    address,
    walletSelected.chain_id,
    true
  ) as any;
  if (!tokens) return;
  const [currentToken, setCurrentToken] = useState<IToken>({} as IToken);
  const [amount, setAmount] = useState("");
  const { balance: tokenBalance, isLoading } = useTokenBalance(
    currentToken?.token_address ?? ZeroAddress,
    address as any
  );
  const balanceFormatted = formattingUtils.formatUnit(tokenBalance ?? "0");
  const { handleDepositToken } = useDepositToken(data?.callback);
  const tbaAddress =
    walletSelected.tba_address ??
    getTbaAddress({
      chain_id: walletSelected.chain_id,
      contract_address: walletSelected.contract_address as any,
      token_id: walletSelected?.token_id?.toString(),
    });
  const onDeposit = async () => {
    await handleDepositToken({
      tokenAddress: currentToken?.token_address as Address,
      amount: formattingUtils.parseUnit(amount) as any,
      tbaAddress: tbaAddress,
      symbol: currentToken?.symbol ?? "",
    });
  };
  const onMaxBalance = () => {
    tokenBalance && currentToken?.token_address && setAmount(balanceFormatted);
  };
  const inValidData =
    !amount ||
    Number(amount) <= 0 ||
    Number(amount) > Number(balanceFormatted) ||
    !currentToken?.token_address;
  const currentConfig = useConnectedChainConfig();
  const approveData = {
    walletFactory: currentConfig?.config?.WALLET_FACTORY,
  };
  // const app = useApprovalOf(currentToken.token_address);
  const { handleApprove, isPending } = useApproveCurrency({
    token: currentToken.token_address,
    value: "" as any,
    spender: currentConfig?.config?.WALLET_FACTORY as Address,
  });
  const onApprove = () => {
    handleApprove(formattingUtils.parseUnit(amount));
  };
  return (
    <BaseCreateModal title={"Deposit"}>
      <div>
        <p className="text-sm py-1 " id="import-token">
          Select token
        </p>
       { tokens && <SelectToken
          tokens={tokens.filter((token: any) => token.balance > 0)}
          currentToken={currentToken}
          setCurrentToken={setCurrentToken}
          showSearch
          placeholder="Select token"
          tbaAddress={address}
        />}
        <p className="text-sm py-2 mt-3">Token amount</p>
        <div className="relative w-full text-xxs">
          <CustomInputNumber
            className="bg-grey-200 h-10 rounded-[8px]  px-3 !text-sm pr-[50px]"
            onChange={(e: any) => {
              if (
                formattingUtils.parseUnit(e?.target?.value) >= tokenBalance &&
                currentToken.token_address
              ) {
                return setAmount(balanceFormatted);
              }
              setAmount(e?.target?.value);
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
        </div>
        {!!currentToken?.token_address && (
          <p className="italic text-green-100 text-sm text-end mt-1">
            Available:{" "}
            {isLoading ? "-" : formattingUtils.toLocalString(balanceFormatted)}{" "}
            {currentToken.symbol}{" "}
          </p>
        )}
        <div className="mt-10">
          <SwitchChainWrapped
            chainId={walletSelected?.chain_id}
            action="deposit"
            mt-10
          >
            {/* <ApprovedCurrencyCheck
              spender={approveData?.walletFactory as Address}
              value={formattingUtils.parseUnit(amount)}
              token={currentToken.token_address}
              fallback={
                <PrimaryButton
                  onClick={onApprove}
                  label="Approve "
                  disabled={inValidData}
                />
              }
              loading={isPending}
            > */}
              <PrimaryButton
                label="Deposit"
                onClick={onDeposit}
                disabled={inValidData}
              />
            {/* </ApprovedCurrencyCheck> */}
          </SwitchChainWrapped>
        </div>
      </div>
    </BaseCreateModal>
  );
};
