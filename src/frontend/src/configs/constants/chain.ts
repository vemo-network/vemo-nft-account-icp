import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  mainnet,
} from "viem/chains";

export enum ChainId {
  BSC = bsc.id,
  BSC_TESTNET = bscTestnet.id,
  AVALANCHE = avalanche.id,
  AVALANCHE_TESTNET = avalancheFuji.id,
  ARB = arbitrum.id,
  ARB_SEPOLIA = arbitrumSepolia.id,
  ETH = mainnet.id,
}

