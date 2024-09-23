import { Address } from "viem";

export interface IPlatform {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  icon: string;
  usecases: IlUseCase[];
}

export interface IlUseCase {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  collection: Collection[];
}

export interface Collection {
  created_at: string;
  updated_at: string;
  is_deleted: number;
  id: number;
  name: string;
  symbol: string;
  chainId: number;
  description: string;
  thumbnail: string;
  contractAddress: Address; // Use the Address type alias here
  creatorAddress: Address;
  ownerAddress: Address;
  dappURI: string;
  status: string;
  decimals: number;
}
