// import { Contract } from "ethers";

import { Contract, Interface } from "ethers6";
import multicall3Abi from "src/configs/abis/multiCall.json";
import { ChainId } from "src/configs/constants/chain";
import { IOnchainSmartWallet } from "src/types/smart-wallet";
import { supportedChains } from "src/wagmi";
import { getLocalStorageData } from "./storage.utils";
import { getTbaAddress } from "./wallet.util";

export const onChainSmartWallet: Map<string, any> = new Map();
export const getChainById = (chainId: ChainId) =>
  supportedChains.find((network) => network.id === chainId);

export const getLinkExplorer = (
  chainId: ChainId,
  type: "tx" | "address",
  tx: string
): string => {
  if (!chainId || !tx) {
    return "";
  }
  const chain = getChainById(chainId);
  const explerer = chain?.blockExplorers?.default?.url;
  return `${explerer}/${type}/${tx}`;
};
export interface Call {
  /**
   * contract instance, see [Contract](https://docs.ethers.io/v5/api/contract/contract/)
   */
  contract: any;
  /**
   * function name
   */
  method: any;
  /**
   * arguments for the function
   */
  args: any;

  address?: any;

  abi?: any;

  chainId: ChainId;
}

export const multicallPerChain = async (
  wbe3ByChain: any,
  multicallAddress: string,
  calls: Call[] | any
) => {
  try {
    const multiContract = new Contract(
      multicallAddress,
      multicall3Abi,
      wbe3ByChain
    );

    const newCalls = calls.map(({ address, name, params, abi }: any) => {
      const contract = new Contract(address, abi, wbe3ByChain);
      const callData = contract.interface.encodeFunctionData(
        name,
        params ?? []
      );
      if (!contract[name]) console.error(`${name} missing on ${address}`);
      return {
        target: address,
        allowFailure: true,
        callData,
      };
    });
    const result = await multiContract.aggregate3.staticCall(newCalls);
    return result?.map((call: any, i: number) => {
      const { returnData, success } = call;
      if (!success || returnData === "0x") return null;
      const { address, abi, name } = calls[i];
      const contract = new Contract(address, abi);
      const decoded = contract.interface.decodeFunctionResult(name, returnData);
      return decoded;
    });
  } catch (error) {
    // console.log("error", error);
    return [];
  }
};

export const saveToOnchainMapSmartWallet = (
  data: IOnchainSmartWallet,
  chainId: ChainId,
  currentWallet?: Map<string, any>
) => {
  const key = `${chainId}_${data.contract_address?.toLowerCase()}_${
    data.token_id
  }`;
  const tba_address = getTbaAddress({
    chain_id: chainId,
    contract_address: data.contract_address,
    token_id: data.token_id.toString(),
  });
  onChainSmartWallet.set(key, { ...data, chainId, tba_address });

  return onChainSmartWallet;
};

export const getAllOnChainSmartWallets = (chainId?: ChainId) => {
  let smartWallets: any = [];

  onChainSmartWallet.forEach((e) => {
    smartWallets.push(e);
  });
  return smartWallets;
};

export const getCurrentFilterChain = () => {
  try {
    const currentChainStored = getLocalStorageData("currentChain");
    if (!currentChainStored) {
      return {
        label: "All chains",
        id: 0,
      };
    }
    return JSON.parse(currentChainStored);
  } catch (error) {
    return {
      label: "All chains",
      id: 0,
    };
  }
};
