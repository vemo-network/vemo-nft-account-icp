// Replace with actual import

import { TokenboundClient } from "src/sdk/src";
import { getImplementAddress } from "src/utils/wallet.util";
import { WalletClient } from "viem";

class TokenboundClientSingleton {
  private static instance: TokenboundClient;
  private static currentChainId: number;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(
    // walletClient: WalletClient,
    chainId: number
  ): TokenboundClient {
    if (
      !TokenboundClientSingleton.instance ||
      TokenboundClientSingleton.currentChainId !== chainId
    ) {
      const config = getImplementAddress(chainId)
      TokenboundClientSingleton.instance = new TokenboundClient({
        // walletClient,
        chainId: chainId,
        // v1
        // implementationAddress: "0x354C2fe546d6890a5132afa10d41620f118703Ad",
        // registryAddress: "0xa3937233d889c16d032fCaec16B3EE2690E2CE1A",
        
        //v2
        implementationAddress: config.implementationAddress,
        registryAddress: config.registryAddress,
      });
      TokenboundClientSingleton.currentChainId = chainId;
    }
    return TokenboundClientSingleton.instance;
  }
}

export default TokenboundClientSingleton;
