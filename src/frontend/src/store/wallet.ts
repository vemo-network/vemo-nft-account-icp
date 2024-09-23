import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IOnchainSmartWallet } from "src/types/smart-wallet";
import { parseTransferERC721Event } from "src/utils/handle-event.utils";
import { saveLocalStorageData } from "src/utils/storage.utils";
import { getTbaAddress } from "src/utils/wallet.util";

interface IWalletOnChain {
  wallet?: any;
  config:
    | {
        [key: string]: {
          [key: number]: number;
        };
      }
    | {};
}

const initialState: IWalletOnChain = {
  wallet: {},
  config: {},
};
const walletSlice = createSlice({
  name: "wallet",
  initialState: initialState,
  reducers: {
    setWallet: (
      state,
      action: PayloadAction<{
        wallet: any;
        config: any;
        account: any;
      }>
    ) => {
      try {
        let currentWallet = { ...state.wallet };
        let currentConfig = { ...state.config };
        action.payload.wallet.map((e: any) => {
          // const logData = parseTransferERC721Event(e);
          // const data = {
          //   ...logData,
          //   chainId: e.chainId,
          //   wallet_collection: e.contractDetail,
          // };
          const data = {
            ...e,
            chainId: e.chainId,
            wallet_collection: e.contractDetail,
          };
          const key = `${e.chainId}_${data.contract_address?.toLowerCase()}_${
            data.token_id
          }`;
          const tba_address = getTbaAddress({
            chain_id: e.chainId,
            contract_address: data.wallet_collection?.isDelegated
              ? data.wallet_collection.issuer
              : data.contract_address,
            token_id: data?.token_id?.toString() ?? "1",
          });
          currentWallet = {
            ...currentWallet,
            [key]: { ...data, chain_id: e.chainId, tba_address },
          };
        });
        state.wallet = currentWallet;
        const combinedObj = { ...currentConfig, ...action.payload.config };
        state.config = combinedObj;
        saveLocalStorageData(
          action.payload.account,
          JSON.stringify({
            wallet: currentWallet,
            config: combinedObj,
          })
        );
        return state;
      } catch (error) {
        console.log("error", error);
      }
    },
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    removeWallet: (state, action) => {
      try {
        const removeNft = action.payload;
        let currentWallet = { ...state.wallet };

        const key = `${
          removeNft.chainId
        }_${removeNft.contract_address?.toLowerCase()}_${removeNft.token_id}`;
        currentWallet = {
          ...currentWallet,
          [key]: {
            ...removeNft,
            chain_id: removeNft.chainId,
            tba_address: removeNft.tba_address,
          },
        };
        state.wallet = currentWallet;
      } catch (error) {}
    },
  },
});
export const { setWallet, setConfig, removeWallet } = walletSlice.actions;

export default walletSlice;
