import { ChainId } from "src/configs/constants/chain";
import { getChainById } from "./chain.utils";

export const getMarketUrl = (url: string) => {
  return `${import.meta.env.VITE_API_SERVICE_URL}${url}`;
};

export const getSSOUrl = (url: string) => {
  return `${import.meta.env.VITE_SSO_SERVICE_URL}${url}`;
};

export const getLinkExplorer = (
  chainId: ChainId,
  type: "tx" | "address",
  tx: string
): string => {
  if (!chainId || !tx) {
    return "";
  }
  const chain = getChainById(chainId);
  const explerer =  chain?.blockExplorers?.default?.url;
  return `${explerer}/${type}/${tx}`;
};
