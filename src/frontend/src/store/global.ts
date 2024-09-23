import { Token } from "@pancakeswap/sdk";
import { createSlice } from "@reduxjs/toolkit";
import { ChainConfigData, ITokenConfig } from "src/types/smart-wallet";
import { Chain } from "viem/chains";

const initialState: {
  selectChain: null | Chain;
  configs: ChainConfigData[] | [];
  tokens: ITokenConfig| null;
} = {
  selectChain: null,
  configs: [],
  tokens: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState: initialState,
  reducers: {
    setSelectChain: (state, action) => {
      state.selectChain = action.payload;
    },
    setGlobalConfig: (state, action) => {
      state.configs = action.payload;
    },
    setTokenConfig: (state, action) => {
      state.tokens = action.payload;
    },
  },
});

export const { setSelectChain, setGlobalConfig, setTokenConfig } =
  globalSlice.actions;

export default globalSlice;
