import { createContext, Dispatch, SetStateAction } from "react";
import WalletConnectWallet from "../utils/WalletConnect";


type WalletConnectContextType = {
  walletConnect: WalletConnectWallet | null
  error: Error | null
  setError: Dispatch<SetStateAction<Error | null>>
  open: boolean
  setOpen: (open: boolean) => void
  isLoading: any
  setIsLoading: Dispatch<SetStateAction<any | undefined>>
}

export const WalletConnectContext = createContext<WalletConnectContextType>({
  walletConnect: null,
  error: null,
  setError: () => {},
  open: false,
  setOpen: (_open: boolean) => {},
  isLoading: undefined,
  setIsLoading: () => {},
})