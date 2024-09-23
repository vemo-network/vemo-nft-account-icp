// import { getDefaultConfig } from 'connectkit'
import { getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  ledgerWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import {
  arbitrumSepolia,
  avalancheFuji,
  bscTestnet,
  Chain,
  mainnet,
  sepolia,
} from "wagmi/chains";
import { arbitrum, bscChain, eth } from "./configs/chains";

const { wallets } = getDefaultWallets();

export const supportedChains: [Chain, ...Chain[]] =
  import.meta.env.VITE_PROJECT_TYPE === "PROD"
    ? [eth, arbitrum]
    : [
        // {...arbitrumSepolia},
        eth,
        arbitrum,
        bscChain,

        avalancheFuji,
        bscTestnet,
      ];

const transports: any =
  import.meta.env.VITE_PROJECT_TYPE === "PROD"
    ? {
        [eth.id]: http(),
        [arbitrum.id]: http(),
        // [bscChain.id]: http(),
      }
    : {
        // [arbitrumSepolia.id]: http(),
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [bscChain.id]: http(),
        [avalancheFuji.id]: http(),
        [bscTestnet.id]: http(),

      };

export const wagmiConfig = getDefaultConfig({
  appName: "Vemo Smart wallet",
  appDescription: "Vemo Smart wallet",
  appUrl: "https://app-stg.vemo.network/wallet",
  // projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  projectId: "06c38aefb19c52e7730cc9d100ccb722",
  chains: supportedChains,
  transports: transports,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  ssr: true,

  // walletConnectProjectId: '7fdb54839896ebfa2f839d8bf6952e84',
});

export const config = createConfig({
  chains: [bscChain, sepolia, arbitrum, avalancheFuji],
  transports: {
    [bscChain.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [avalancheFuji.id]: http(),
  },
});
