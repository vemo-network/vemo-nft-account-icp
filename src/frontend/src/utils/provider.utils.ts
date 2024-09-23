// Replace with actual import

import { JsonRpcProvider } from "ethers6";
import { Chain } from "viem";

class ProviderClientSingleton {
  private static instance: JsonRpcProvider;
  private static currentChainId: number;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(
    // walletClient: WalletClient,
    chain: Chain
  ): JsonRpcProvider {
    if (
      !ProviderClientSingleton.instance ||
      ProviderClientSingleton.currentChainId !== chain.id
    ) {
      ProviderClientSingleton.instance = new JsonRpcProvider(
        chain?.rpcUrls?.default?.http[0],
        chain?.id
      );
      ProviderClientSingleton.currentChainId = chain.id;
    }
    return ProviderClientSingleton.instance;
  }
}

export default ProviderClientSingleton;
