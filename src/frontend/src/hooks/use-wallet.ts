import { useSmartWallet } from "@context/smart-wallet-context";
import { RootState } from "@store/index";
import { setWallet } from "@store/wallet";
import { useQuery } from "@tanstack/react-query";
import { AssistedJsonRpcProvider } from "assisted-json-rpc-provider";
import { JsonRpcProvider, Wallet, zeroPadValue } from "ethers6";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux-saga";
import {
  ILogConfig,
  INFTContract,
  IOnchainSmartWallet,
} from "src/types/smart-wallet";
import { getChainById } from "src/utils/chain.utils";
import { parseTransferERC721Event } from "src/utils/handle-event.utils";
import { supportedChains } from "src/wagmi";
import { useReadContracts } from "wagmi";
import { useAuthSaga } from "./use-auth";
import { useAllChainConfig } from "./use-config";

// const { AssistedJsonRpcProvider } = require("assisted-json-rpc-provider");

export const useWalletDetail = () => {
  const data = useSmartWallet();
  return {
    walletSelected: data.walletSelected,
    setWalletSelected: data.setWalletSelected,
  };
};

export const useAllWallets = () => {
  const data = useSmartWallet();
  return data.smartWallet;
};

export const useOnWalletsConfig = () => {
  const { address } = useAuthSaga();
  const data = useSelector((state: RootState) => state.wallet.config);
  return address && (data as any)[address.toLowerCase() as any];
};

export const useViewWalletDetailById = () => {
  const smartWallets = useOnChainWalletStored();
  const { setWalletSelected } = useSmartWallet();
  const setWallet = useCallback(
    (data: { tbaAddress: string; chainId: Number; tokenId: string }) => {
      const newWallet = smartWallets?.find(
        (e: any) =>
          e.chain_id === data.chainId &&
          e.tba_address?.toLowerCase() === data.tbaAddress?.toLowerCase() &&
          Number(e.token_id) === Number(data.tokenId)
      );
      newWallet && setWalletSelected(newWallet);
    },
    [smartWallets, setWalletSelected, smartWallets.length]
  );
  return { setWallet };
};
const setupConfig = (
  chainId: number,
  account: string,
  blockConfig: {
    [key: number]: number;
  },
  config: ILogConfig,
  nftContracts?: INFTContract[]
) => {
  const bscRpc = config.rpc;
  const provider = new JsonRpcProvider(bscRpc);

  const queryProvider = new AssistedJsonRpcProvider(provider, {
    url: config.url,
    apiKeys: config.apiKeys,
    rateLimitCount: config.rateLimitCount,
    rateLimitDuration: config.rateLimitDuration,
  }) as any;
  const accTopic = zeroPadValue(account as any, 32);
  const filter = {
    fromBlock: blockConfig
      ? blockConfig[chainId] ?? config.fromBlock
      : config.fromBlock,
    toBlock: 9999999999,
    topics: [
      null,
      [null, accTopic],
      [null, null, accTopic],
      // [null, null, null, accTopic],
    ],
  };
  return {
    queryProvider,
    filter,
  };
};
export const useOnChainWalletStored = (): IOnchainSmartWallet[] => {
  const data = useSelector((state: RootState) => state.wallet.wallet);
  const { chainId, address: account } = useAuthSaga();
  const filteredByChainId = Object.values(data).filter(
    (e: any) => e.to.toLowerCase() === account?.toLowerCase()
  );
  return filteredByChainId as any;
};
const whitelistTopics = [
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
];
export const useWalletsOnchain = () => {
  const { chainId, address: account } = useAuthSaga();
  const dispatch = useDispatch();
  const allChainConfig = useAllChainConfig();
  const blockConfig = useOnWalletsConfig();
  const {
    data: logResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["get-onchain-wallet", account, allChainConfig?.length],
    queryFn: async () => {
      const res = await Promise.allSettled(
        supportedChains.map(async (e) => {
          const chainConfig = allChainConfig?.find(
            (config) => config.chainId === e.id
          );
          const logConfig = chainConfig?.logConfig;
          const config =
            logConfig &&
            setupConfig(e.id, account as any, blockConfig, logConfig);

          const data = await config?.queryProvider.getLogs(config.filter);

          return {
            data,
            chainId: e.id,
          };
        })
      );
      // whitelist collections
      if (res) {
        const exitsData = res.filter((res) => res.status === "fulfilled");
        let blockFetchConfig = {};
        if (exitsData.length > 0) {
          try {
            exitsData
              .filter((e) => !!e.value?.data?.length)
              .forEach((res) => {
                const wallets = res.value?.data;
                blockFetchConfig = {
                  ...blockFetchConfig,
                  [res.value?.chainId]:
                    wallets[wallets.length - 1].blockNumber + 1,
                };
              });
            const mergeData = exitsData.flatMap((res) =>
              res.value?.data?.map((e: any) => {
                const chainId = res.value?.chainId;
                return {
                  ...e,
                  chainId,
                };
              })
            );
            const filterData = mergeData
              .filter(
                (e) =>
                  !!allChainConfig.find(
                    (config) => config.chainId === e.chainId
                  )
              )
              .filter((e) =>
                whitelistTopics.find(
                  (topic) => topic.toLowerCase() === e.topics[0]?.toLowerCase()
                )
              );
            const sortedData = filterData.sort(
              (a, b) => parseInt(b.timeStamp, 16) - parseInt(a.timeStamp, 16)
            );
            const parseData = sortedData
              .map((e) => {
                const logData = parseTransferERC721Event(e);
                return {
                  ...logData,
                  chainId: e.chainId,
                };
              })
              .filter((e) => !!e.contract_address);
            // console.log("parseData", parseData);

            return {
              parseData,
              blockFetchConfig,
            };
          } catch (error) {
            return false;
          }
        }
      }
    },
    enabled: !!account && !!chainId && !!allChainConfig?.length,
  }) as any;
  const abi = [
    {
      type: "function",
      name: "name",
      inputs: [],
      outputs: [{ name: "", type: "string", internalType: "string" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "issuer",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
  ];
  const logData = logResponse?.parseData;
  const blockFetchConfig = logResponse?.blockFetchConfig;
  const calls =
    logData?.length &&
    logData.map((e: any) => {
      return [
        {
          address: e.contract_address,
          abi: abi,
          functionName: "name",
          args: [],
          chainId: e.chainId,
        },
        {
          address: e.contract_address,
          abi: abi,
          functionName: "issuer",
          args: [],
          chainId: e.chainId,
        },
      ];
    });
  const {
    data: details,
    isLoading: loadingOnChainData,
    refetch: refetchCallOnchainData,
  } = useReadContracts({
    contracts: calls?.length ? calls?.flat() : [],
  });
  const chunkRes = details && chunkData(details as any, 2);
  const formatData =
    chunkRes &&
    logData
      .map((e: any, index: any) => {
        const detail = chunkRes[index].map((detail) => {
          if (detail.status === "success") {
            return detail;
          }
        });
        return {
          ...e,
          contractDetail: {
            name: detail[0].result,
            contractAddress: e.contract_address,
            isDelegated: !!detail[1],
            issuer: !!detail[1] ? detail[1].result : null,
          },
        };
      })
      .filter((e: any) => {
        const chainConfig = allChainConfig?.find(
          (config) => config.chainId === e.chainId
        );
        const vemoCollection =
          chainConfig?.collection.contractAddress?.toLowerCase();
        if (e.contractDetail.isDelegated) {
          return e.contractDetail.issuer?.toLowerCase() === vemoCollection;
        }
        return e.contract_address?.toLowerCase() === vemoCollection;
      });

  useEffect(() => {
    if (!!formatData?.length) {
      dispatch(
        setWallet({
          wallet: formatData.reverse(),
          config: {
            [account?.toLowerCase() as any]: blockFetchConfig,
          },
          account,
        })
      );
    }
  }, [formatData?.length]);
  return {
    data: logResponse,
    isLoading: isLoading || loadingOnChainData,
    refetch : () => {
      refetch()
      refetchCallOnchainData()
    },
  };
};
const abi = [
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export const useAllTBAs = (): {
  data: AnyAction[];
  isLoading: boolean;
} => {
  const { smartWallets } = useAllWallets();
  // const isTestnet = getChainById(Number(wallet?.chain_id))?.testnet;
  // const chainQuery = isTestnet
  //   ? supportedChains.filter((e) => !!e.testnet)
  //   : supportedChains.filter((e) => !e.testnet);
  const calls =
    smartWallets?.length > 0
      ? smartWallets.map((wallet) => {
          const tbaChainToDeploys = supportedChains.filter(
            (e) => e.id !== Number(wallet?.chain_id)
          );
          return tbaChainToDeploys.map((e) => {
            return {
              address: wallet?.tba_address,
              abi,
              chainId: e.id,
              functionName: "token",
              args: [],
            };
          });
        })
      : [];
  const { data: tbaWalletsOnChain, isLoading } = useReadContracts({
    contracts: calls.flat() as any,
  });

  const data = tbaWalletsOnChain
    ?.map((e, index) => {
      return { ...e, chain_id: calls.flat()[index].chainId };
    })
    .map((e, i) => {
      if (e.status === "success") {
        return {
          ...e,
          chainId: e.chain_id,
        };
      }
    });
  const formatData = chunkData(data as any, supportedChains.length - 1)
    .map((e) => {
      return e.filter((e) => !!e);
    })
    .map((data, index) => {
      if (!!data.length) {
        // return {
        //   // ...smartWallets[index],
        //   tbas: data,
        // };
        return data;
      }
    });

  return {
    data: formatData as any,
    isLoading,
  };
};

const chunkData = (data: any[], chunkSize: number) => {
  const result = [];
  if (!data?.length || !chunkSize) {
    return [];
  }
  for (let i = 0; i < data.length; i += chunkSize) {
    result.push(data.slice(i, i + chunkSize));
  }
  return result;
};
