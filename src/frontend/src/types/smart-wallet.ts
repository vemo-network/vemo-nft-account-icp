import { Address } from "viem";
import { Collection } from "./platform.type";
import { Token } from "@pancakeswap/sdk";

export interface WalletsResponse {
  // wallets: Wallet[];
  // total: number;
}
export const EIP155 = "eip155" as const;

interface WalletCollection {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  symbol: string;
  chainId: number;
  description: string;
  thumbnail: string;
  contractAddress: Address;
  creatorAddress: Address;
  ownerAddress: Address;
  dappURI: string;
  status: string;
  decimals: number;
  platform_usecase: PlatformUsecase;
  isDelegated?: boolean;
  issuer?: string;
}

export interface Wallet {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  wallet_collection_id: number;
  chain_id: number;
  contract_address: Address;
  token_id: number;
  name: string;
  image: string;
  status: string;
  owner_address: Address;
  tba_address: Address;
  wallet_collection: WalletCollection;
  krystal_point: string;
  tbaChain?: number;
  tbas?: {
    chainId: number;
  }[];
}
interface PlatformUsecase {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  platform: Platform;
}

interface Platform {
  created_at: string | null;
  updated_at: string | null;
  is_deleted: number;
  id: number;
  name: string;
  icon: string;
}
export interface PlatformType {
  name: string;
  title: string;
}

export enum ConnectStatus {
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
  FINISHED = "Finished",
}

export enum WalletStatus {
  SIGNING = "SINGING",
}

export enum EventsName {
  WalletCreated = "WalletCreated",
}

export interface IEventData {
  account: string;
  nftCollection: string;
  tokenId: string;
  owner: string;
}

export interface FilterParams {
  chain_id: string | number;
  platform_id?: number;
  tba_address?: string;
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: string;
}

export interface IDelegationContract {
  contractAddress: string;
  termAddress: string;
  name: string;
}

export interface INFTContract {
  contractAddress: Address;
  name: string;
  isDelegated?: boolean;
  issuer?: Address;
}

interface Config {
  CHAIN_ICON: string;
  CHAIN_NAME: string;
  PROVIDER_URL: string;
  WALLET_FACTORY: string;
  CHAIN_DARK_ICON: string;
  NATIVE_CURRENCY: NativeCurrency;
  VOUCHER_FACTORY: string;
  SUB_QUERY_ENDPOINT: string;
  VESTING_POOL_FACTORY: string;
  WALLET_SUB_QUERY_ENDPOINT: string;
  FARMER_CONTRACTS?: {
    address: string;
    name: string;
  }[];
  DELEGATION_CONTRACTS?: IDelegationContract[];
  NFT_CONTRACTS?: INFTContract[];
}

export interface ChainConfigData {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  chainId: number;
  config: Config;
  status: number;
  tag: number;
  collection: Collection;
  logConfig: ILogConfig;
}

export interface IERC20 {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  symbol: string;
  chainId: number;
  address: Address;
  decimals: number;
  logoUri: string;
}

export interface ITBA {
  blockHeight: string;
  chainId: number;
  id: string;
  nftCollection: string;
  owner: string;
  tokenId: string;
}

export interface BlockchainLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface IOnchainSmartWallet {
  from: string;
  to: string;
  token_id: number;
  contract_address: string;
  wallet_collection: {
    name: string;
    dappURI?: string;
    isDelegated?: boolean;
    contractAddress?: string;
    issuer?: string;
  };
  chain_id: number;
  tba_address?: string;
  owner_address?: string;
  tbas?: {
    chainId: number;
  }[];
  tbaChain?: number;
}

export interface ILogConfig {
  fromBlock: number;
  url: string;
  rpc: string;
  apiKeys?: string[];
  rateLimitCount?: number;
  rateLimitDuration?: number;
}

export interface ITokenConfig {
  [key: string]: {
    [key: string]: Token;
  };
} 
