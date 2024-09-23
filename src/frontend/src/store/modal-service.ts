import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum ModalType {
  SUCCESS,
  FAILED,
  DEFAULT,
  OPEN,
  CREATE,
}

export enum ModalName {
  CREATE_WALLET,
  DEPOSIT_TOKEN,
  WITHDRAW_TOKEN,
  CLONE_WALLET,
  DELEGATE_WALLET,
  REVOKE_WALLET,
}
export interface IModalData {
  data: any;
  type: ModalType;
  name: ModalName;
  callback?: (data?: any) => void;
  onClose?: () => void;
}
type SliceState = {
  isOpened: boolean;
  data: IModalData | null;
};

const initialState: SliceState = {
  isOpened: false,
  data: null,
};

export const modalService = createSlice({
  name: "modal_service",
  initialState,
  reducers: {
    resetModalState: (state) => {
      state.isOpened = false;
      state.data = null;
    },
    setModal: (state, action) => {
      state.isOpened = action.payload;
    },
    setDataModal: (state, action: PayloadAction<IModalData>) => {
      state.data = action.payload;
    },
  },
});

const { setModal, setDataModal, resetModalState } = modalService.actions;
export { setModal, setDataModal, resetModalState };
