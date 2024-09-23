import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type AuthState = {
  oauth?: any
  wallet?: any
  chainId?: any
  error?: any
  dareId?: any
  connectorName?: any
}

const initialOAuthSagaState: AuthState = {
  oauth: null,
}

const authSagaSlice = createSlice({
  name: "auth_saga",
  initialState: initialOAuthSagaState,
  reducers: {
    //Todo defined type
    login(state, action: PayloadAction<any>) {},
    loginSuccess(state, action: PayloadAction<AuthState>) {
      if (action.payload.oauth) state.oauth = action.payload.oauth
      if (action.payload.wallet) state.wallet = action.payload.wallet
      if (action.payload.chainId) state.chainId = action.payload.chainId
      if (action.payload.dareId) state.dareId = action.payload.dareId
      if (action.payload.connectorName) state.connectorName = action.payload.connectorName

      state.error = null
    },
    loginFailed(state, action: PayloadAction<AuthState>) {
      state.oauth = null
      state.wallet = null
      state.chainId = null
      state.dareId = null

      state.error = action.payload.error
    },
    logout(state, action: PayloadAction<any>) {},
    logoutSuccess(state, action: PayloadAction<any>) {
      state.oauth = null
      state.wallet = null
      state.chainId = null
      state.dareId = null

      state.error = null
    },
    logoutFailed(state, action: PayloadAction<AuthState>) {
      state.error = action.payload.error
    },
    clearError(state, action: PayloadAction<null>) {
      state.error = null
    },
    refreshLogin(state, action: PayloadAction<any>) {},
    refreshLoginSuccess(state, action: PayloadAction<any>) {
      state.oauth = action.payload.oauth
    },
    changeNetwork(state, action: PayloadAction<any>) {},
    addError(state, action: PayloadAction<any>) {
      state.error = action.payload.error
    },
    changeAccount(state, action: PayloadAction<any>) {},
    changeAccountSuccess(state, action: PayloadAction<AuthState>) {
      state.oauth = action.payload.oauth
      state.wallet = action.payload.wallet
      state.chainId = action.payload.chainId
      state.dareId = action.payload.dareId

      state.error = null
    },
  },
})

export const {
  login,
  logout,
  loginSuccess,
  logoutSuccess,
  loginFailed,
  logoutFailed,
  clearError,
  refreshLogin,
  refreshLoginSuccess,
  changeAccount,
  changeAccountSuccess,
  changeNetwork,
  addError,
} = authSagaSlice.actions

export default authSagaSlice
