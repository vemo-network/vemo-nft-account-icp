import { PrimaryButton } from "@components/buttons/primary-button";
import { LoadingAnimation } from "@components/loading-animation";
import { EmptyState } from "@components/state/empty-state";
import { WarningComponent } from "@components/state/warning-component";
import { ModalName, ModalType } from "@store/modal-service";
import List from "antd/lib/list";
import { useAuthSaga } from "src/hooks/use-auth";
import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";
import { useBalances } from "src/hooks/use-tokens";
import { ButtonStyles } from "src/types/common.type";
import { Wallet } from "src/types/smart-wallet";
import { IToken } from "src/types/token.types";
import { formattingUtils } from "src/utils/formatting-utils";

export const WalletTokenBalances = ({
  walletSelected,
}: {
  walletSelected: Wallet | null;
}) => {
  const { onOpenModal } = useOpenModalCreate();
  const { chainId, address } = useAuthSaga();
  // const { data: ownerTokenBalances, isLoading } = useQuery({
  //   queryKey: ["get-owner-token-balances", chainId, address],
  //   queryFn: async () => {
  //     const res = await api.WalletService.getTokenBalance({
  //       chainId: chainId ?? 0,
  //       address: address ?? ZeroAddress,
  //     });
  //     return res;
  //   },
  //   enabled: !!chainId && !!address,
  // });
  const { balances: ownerTokenBalances, isLoading } = useBalances(
    address,
    chainId,
    true
  );
  // const { data: tokenBalances } = useQuery({
  //   queryKey: [
  //     "get-token-balances",
  //     walletSelected?.chain_id,
  //     walletSelected?.tba_address,
  //   ],
  //   queryFn: async () => {
  //     const res = await api.WalletService.getTokenBalance({
  //       chainId: walletSelected!.chain_id ?? 0,
  //       address: walletSelected!.tba_address ?? ZeroAddress,
  //     });
  //     return res;
  //   },
  //   enabled: !!walletSelected?.chain_id && !!walletSelected?.tba_address,
  // });
  const {
    balances: tokenBalances,
    isLoading: loadingTbaBalances,
    refetch,
  } = useBalances(
    walletSelected?.tba_address,
    walletSelected?.tbaChain ?? walletSelected?.chain_id
  );

  const onWithdraw = () => {
    onOpenModal(
      refetch,
      { tokens: tokenBalances, wallet: walletSelected },
      ModalName.WITHDRAW_TOKEN,
      ModalType.CREATE
    );
  };
  const onDeposit = () => {
    onOpenModal(
      refetch,
      { tokens: ownerTokenBalances, wallet: walletSelected },
      ModalName.DEPOSIT_TOKEN,
      ModalType.CREATE
    );
  };
  // const isWithdrawable = !!tokenBalances?.length;
  // const isDepositable = !!ownerTokenBalances?.length;
  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex justify-between items-start lg:items-center  gap-2">
        <p className="whitespace-nowrap">Token Balance</p>
        <div className="flex gap-2 w-full lg:w-2/3 justify-end">
          {/* <SearchComponent
            placeholder="Search token"
            className=""
            onChange={() => null}
          /> */}
          <PrimaryButton
            label="Withdraw"
            onClick={onWithdraw}
            // color={ButtonStyles.SECONDARY}
            className="!h-10 text-sm max-w-[100px] !bg-primary-500 hover:bg-primary-500 "
            // disabled={!isWithdrawable}
          />
          <PrimaryButton
            label="Deposit"
            onClick={onDeposit}
            className="!h-10 text-sm max-w-[100px]"
            // disabled={!isDepositable}
          />
        </div>
      </div>
      {/* <WarningComponent /> */}

      <div className="py-4 bg-blue-500 rounded-[8px] pr-2">
        {" "}
        <div>
          <div className="flex justify-between pl-4 pr-4 py-2">
            <p>Token</p>
            <p>Amount</p>
          </div>
          {isLoading || loadingTbaBalances ? (
            <div className="flex justify-center h-full">
              <LoadingAnimation />
            </div>
          ) : !!tokenBalances?.length ? (
            <List
              className=" max-h-[300px] overflow-auto px-4"
              bordered
              dataSource={tokenBalances as any}
              rowKey={(item) => {
                return item.key ?? "";
              }}
              renderItem={(item: IToken) => (
                <List.Item>
                  <div className="flex justify-between w-full py-1 font-normal">
                    <p className=" text-[14px]">{item.symbol}</p>
                    <p className=" text-[14px]">
                      {formattingUtils.toLocalString(
                        formattingUtils.formatUnit(item.balance)
                      )}
                    </p>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div className="flex justify-center min-h-[200px]">
              <EmptyState title="No tokens in your wallet" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
