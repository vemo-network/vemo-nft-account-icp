import { ChainId } from "src/configs/constants/chain";
import TokenboundClientSingleton from "src/services/token-bound-service";
import { IlUseCase } from "src/types/platform.type";
import { supportedChains } from "src/wagmi";
import { Address } from "viem";
import { arbitrumSepolia, avalancheFuji, bsc, bscTestnet } from "viem/chains";
import { EIP155 } from "./WalletConnect";

export const getPeerName = (peer: any): string => {
  return peer.metadata?.name || peer.metadata?.url || "";
};

const trackedRequests = [
  "personal_sign",
  "eth_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
];
export const trackRequest = (peerUrl: string, method: string) => {
  if (trackedRequests.includes(method)) {
    console.log("peerUrl");
  }
};

export const getTbaAddress = ({
  chain_id,
  contract_address,
  token_id,
}: {
  chain_id: number;
  contract_address: string;
  token_id: string;
}) => {
  const tokenboundInstance = TokenboundClientSingleton.getInstance(chain_id);
  const tbaAddress = tokenboundInstance.getAccount({
    tokenContract: contract_address as any,
    tokenId: token_id,
  });
  return tbaAddress;
};

export const getImplementAddress = (
  chainId: ChainId
): {
  implementationAddress: Address;
  registryAddress: Address;
} => {
  const testnetConfig: any = {
    implementationAddress: "0x40E70BB7768e397A62A08f4945A8EC3860E90688",
    registryAddress: "0x000000006551c19487814612e58FE06813775758",
  };
  switch (chainId) {
    case bscTestnet.id:
    case arbitrumSepolia.id:
    case avalancheFuji.id: {
      return testnetConfig;
    }
    case bsc.id: {
      return {
        implementationAddress: "0xE1E5F84F59BB5B55fAdec8b9496B70Ca0A312c73",
        registryAddress: "0x000000006551c19487814612e58FE06813775758",
      };
    }
    default: {
      return {
        implementationAddress: "0xE1E5F84F59BB5B55fAdec8b9496B70Ca0A312c73",
        registryAddress: "0x000000006551c19487814612e58FE06813775758",
      };
    }
  }
};

export const getChainsFromUsecase = (usecases: IlUseCase[]) => {
  if (!usecases?.length) {
    return [];
  }
  return supportedChains.filter((chain) => {
    return usecases.some((usecase) => {
      return usecase.collection.some((c) => c.chainId === chain.id);
    });
  });
};
export const getEip155ChainId = (chainId: string): string => {
  return `${EIP155}:${chainId}`;
};

export const getPlatformIcon = (dappUrl: string) => {
  // if (dappUrl.toLowerCase().includes("krystal")) {
  //   return "/icons/krystal-icon.svg";
  // }
  // if (dappUrl.toLowerCase().includes("vemo")) {
  //   return "/icons/vemo-icon.svg";
  // }
  return "/icons/vemo-icon.svg";
};

export const getSeedJazzIcon = (data: string) => {
  if (!data || data.length < 20) {
    return 12345;
  }
  const addr = data.slice(2, 20);
  const seed = parseInt(addr, 16);
  return seed;
};
