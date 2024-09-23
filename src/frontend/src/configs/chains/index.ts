import { arbitrum as arb, bsc, mainnet } from "viem/chains";

function shuffleArray(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const bscChain = { ...bsc, name: "BNB Chain" };
export const eth = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: shuffleArray([
        "https://ethereum.blockpi.network/v1/rpc/public",
        "https://eth-mainnet.public.blastapi.io	",
      ]),
    },
  },
};

export const arbitrum = {
  ...arb,
  name: "Arbitrum",
};
