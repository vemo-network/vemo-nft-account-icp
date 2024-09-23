import { ChainId, CurrencyAmount, ERC20Token, Token } from "@pancakeswap/sdk";
import { RootState } from "@store/index";
import { useQuery } from "@tanstack/react-query";
import { ZeroAddress } from "ethers6";
import _, { clone, memoize } from "lodash";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import api from "src/services";
import { allTokens } from "src/tokens/allTokens";
import { IERC20 } from "src/types/smart-wallet";
import { getChainById, multicallPerChain } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import ProviderClientSingleton from "src/utils/provider.utils";
import { getLocalStorageData } from "src/utils/storage.utils";
import { Address, erc20Abi, getAddress, isAddress } from "viem";
import { useAuthSaga } from "./use-auth";
import { useEtherBalance } from "./use-balance";
import { useCurrentOpeningModal } from "./use-modal";

export const safeGetAddress = memoize((value: any): Address | undefined => {
  try {
    let value_ = value;
    if (typeof value === "string" && !value.startsWith("0x")) {
      value_ = `0x${value}`;
    }
    return getAddress(value_);
  } catch {
    return undefined;
  }
});

const mapWithoutUrls = (tokenMap?: any, chainId?: number) => {
  if (!tokenMap || !chainId) return {};
  return Object.keys(tokenMap[chainId] || {}).reduce<{
    [address: string]: ERC20Token;
  }>((newMap, address) => {
    const checksumAddress = safeGetAddress(address);

    if (checksumAddress && !newMap[checksumAddress]) {
      newMap[checksumAddress] = tokenMap[chainId][address].token;
    }

    return newMap;
  }, {});
};

export function getTokensByChain(chainId?: ChainId, tokens?: any): Token[] {
  if (!chainId || !tokens) {
    return [];
  }
  const tokenMap = tokens[chainId];
  if (!tokenMap) {
    return [];
  }
  return Object.values(tokenMap);
}

export function useAllTokens(chainId?: ChainId) {
  const { chainId: connectedChainId } = useAuthSaga();
  const tokens = useSelector((state: RootState) => state.global.tokens);

  return getTokensByChain(chainId ?? connectedChainId, tokens);
}
export const multiCall = {
  [ChainId.ETHEREUM]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.GOERLI]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.BSC]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.BSC_TESTNET]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.ZKSYNC_TESTNET]: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
  [ChainId.ZKSYNC]: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
  [ChainId.ARBITRUM_ONE]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.ARBITRUM_GOERLI]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.POLYGON_ZKEVM]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.POLYGON_ZKEVM_TESTNET]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.OPBNB]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.OPBNB_TESTNET]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.BASE_TESTNET]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [ChainId.SCROLL_SEPOLIA]: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
const formatTokenBalanceData = () => {};
export const useBalances = (
  walletAddress?: Address,
  queryChainId?: ChainId,
  isShowAll?: boolean
) => {
  const { chainId: connectedChainId, connector, address } = useAuthSaga();
  const chainId = queryChainId ?? connectedChainId;
  const chain = getChainById(chainId);
  const allTokens = useAllTokens(chainId);
  const account = walletAddress ?? (address as any);
  const nativeBalance = useEtherBalance(account, {
    chainId,
  });
  useCurrentOpeningModal();

  let tokenImportStored = getLocalStorageData("token-import");

  const { data } = useQuery({
    queryKey: ["imported-tokens", address, chainId],
    queryFn: async () => {
      return await api.WalletService.getTokenImported({
        chain_id: chainId,
        wallet_address: address as Address,
      });
    },
    enabled: !!address && !!chain,
  });
  let tokenImported = data?.length
    ? data?.concat(JSON.parse(tokenImportStored ?? "[]"))
    : JSON.parse(tokenImportStored ?? "[]");
  const tokens = tokenImported?.length
    ? allTokens.concat(tokenImported as any)
    : allTokens;
  const calls =
    account &&
    tokens?.map((e) => {
      return {
        address: e.address,
        name: "balanceOf",
        params: [account],
        abi: erc20Abi,
      };
    });
  const provider = chain && ProviderClientSingleton.getInstance(chain);
  const {
    data: balances,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "get-all-token-balances",
      account,
      chainId,
      chain,
      provider,
      calls?.length,
    ],
    queryFn: async () => {
      const res = await multicallPerChain(
        provider,
        chain?.contracts?.multicall3?.address as Address,
        calls
      );
      return res;
    },
    enabled: !!account && !!calls?.length && !!chain && !!provider,
  });
  const formattedData = balances?.map((e: any, index: number) => {
    const token = tokens[index];
    return {
      token,
      balance: BigInt(e?.toString()),
      symbol: token.symbol,
      token_address: token.address as Address,
      decimals: token.decimals,
      name: token.name,
      key: `${token.address}-${account}-${chainId}`,
    };
  });
  const allBalances = [
    {
      name: chain?.nativeCurrency.name,
      balance: nativeBalance?.balance,
      decimals: chain?.nativeCurrency.decimals,
      token_address: ZeroAddress,
      symbol: chain?.nativeCurrency.symbol,
      key: `${ZeroAddress}-${account}-${chainId}`,
    },
  ].concat(
    formattedData?.sort((a: any, b: any) => {
      if (a.balance > BigInt(0) && b.balance === BigInt(0)) {
        return -1;
      } else if (a.balance === BigInt(0) && b.balance > BigInt(0)) {
        return 1;
      } else {
        return 0;
      }
    })
  );

  return {
    balances: isShowAll
      ? allBalances.filter((e) => !!e)
      : allBalances.filter((e) => !!e && e.balance !== BigInt(0)),
    isLoading,
    refetch : () => {
      refetch(),
      nativeBalance?.refetch()
    },
  };
};
