import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type SliceState = {
  isLoading: boolean
  withWarning?: boolean
}

const initialState: SliceState = {
  isLoading: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    dismiss: () => initialState,

    setLoading: (state, action: PayloadAction<SliceState>) => {
      state.isLoading = action.payload.isLoading
      state.withWarning = action.payload.withWarning
    },
  },
})

export const { setLoading, dismiss } = uiSlice.actions
export default uiSlice
