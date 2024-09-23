import { Address } from "viem";

export interface IToken {
  symbol?: string;
  token_address: Address;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam?: boolean;
  verified_contract?: Address;
  total_supply?: string;
  total_supply_formatted?: string;
  percentage_relative_to_total_supply?: number;
  key?: string;
}
