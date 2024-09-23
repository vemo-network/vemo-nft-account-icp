import { PrimaryButton } from "@components/buttons/primary-button";
import { LoadingAnimation } from "@components/loading-animation";
import { SelectComponent } from "@components/select";
import { EmptyState } from "@components/state/empty-state";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useTokenBalance } from "src/hooks/use-balance";
import useDebounce from "src/hooks/use-debound";
import { useImportToken } from "src/hooks/use-import-token";
import { IToken } from "src/types/token.types";
import { formattingUtils } from "src/utils/formatting-utils";
import { Address, isAddress } from "viem";
import { useToken } from "wagmi";

export const SelectToken = ({
  currentToken,
  setCurrentToken,
  tokens,
  showSearch = false,
  placeholder = "",
  tbaAddress,
}: {
  currentToken: IToken;
  setCurrentToken: (token: IToken) => void;
  tokens: IToken[];
  showSearch?: boolean;
  placeholder?: string;
  tbaAddress?: any;
}) => {
  const onSelectToken = (value: string) => {
    const address = value.split("_")[1];
    const token = tokens.find(
      (e) => e.token_address?.toLowerCase() === address?.toLowerCase()
    );
    token && setCurrentToken(token);
  };
  const selectTokens = useMemo(() => {
    return tokens?.map((val: IToken, i) => ({
      label: (
        <div className="flex items-center gap-[6px] text-[16px] font-medium ml-3 justify-between label-search">
          {val?.symbol}
          <div className="pr-3 token-balance">
            {" "}
            {formattingUtils.toLocalString(
              formattingUtils.formatUnit(val?.balance)
            )}
          </div>
        </div>
      ),
      value: `${val?.symbol}_${val?.token_address}`,
    }));
  }, [tokens?.length]);
  const [keyword, setKeyword] = useState("");
  const debouncedSearchTerm = useDebounce(keyword, 100); // 500ms delay
  const isErc20 = isAddress(keyword);
  const { data, isFetched } = useToken({
    address: (debouncedSearchTerm ?? keyword) as Address,
  });
  const { balance: tokenBalance, isLoading } = useTokenBalance(
    debouncedSearchTerm,
    tbaAddress as any
  );
  const handleSearch = useCallback((e: any) => {
    setKeyword(e);
  }, []);
  const {
    handleImport,
    isPending: pendingImport,
  } = useImportToken();
  const [newList, setNewList] = useState();

  const onImport = async () => {
    const elm = document.getElementById("select");

    const res = await handleImport(debouncedSearchTerm as any);
    if (res) {
      setCurrentToken({
        ...res,
        token_address: res.address,
      } as any);
      let newData = selectTokens.concat([
        {
          label: (
            <div className="flex items-center gap-[6px] text-[16px] font-medium ml-3 justify-between label-search">
              {res?.symbol}
              <div className="pr-3 token-balance">
                {" "}
                {formattingUtils.toLocalString(
                  formattingUtils.formatUnit(tokenBalance)
                )}
              </div>
            </div>
          ),
          value: `${res?.symbol}_${res?.address}`,
        },
      ]);
      setNewList(newData as any);
    }
    elm?.blur();
  };
  const renderEmptyState = useMemo(() => {
    if (!isFetched && isErc20) {
      return (
        <div className="p-3 justify-center items-center flex h-[100px]">
          <LoadingAnimation />
        </div>
      );
    }
    if (data && isErc20) {
      return (
        <div className="p-3 flex justify-between items-center">
          <p>{data.symbol}</p>
          <PrimaryButton
            label="Import token"
            onClick={onImport}
            className="!h-10 text-sm max-w-[120px]"
            loading={pendingImport}
          />
        </div>
      );
    }
    return (
      <>
        {(isFetched || !isErc20) && (
          <div
            className="flex justify-center items-center py-4"
            id="empty-search"
          >
            <EmptyState title="No results found." />
          </div>
        )}
      </>
    );
  }, [data, isFetched, isErc20, pendingImport]);

  return (
    <SelectComponent
      bgfill="dark"
      className={clsx("w-full !h-10 !rounded-lg text-[14px] pl-2")}
      optionsData={newList ?? selectTokens}
      onSelect={onSelectToken}
      defaultValue={currentToken?.symbol}
      value={currentToken?.symbol ?? ''}
      filterOption={(input: any, option: any) => {
        return (option?.value ?? "")
          .toLowerCase()
          .includes(input.toLowerCase());
      }}
      showSearch={showSearch}
      placeholder={placeholder}
      emptyState={renderEmptyState}
      onSearch={handleSearch}
    />
  );
};
