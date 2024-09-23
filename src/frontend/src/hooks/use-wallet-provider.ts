import { useMemo } from "react"
import { SafeWalletProvider } from "../utils/wallet-provider"

const useSafeWalletProvider = (): SafeWalletProvider | undefined => {
  // const { safe, safeAddress } = useSafeInfo()
  const  chainId = 42161
  const safeAddress = "0xC69641018937D41Ef9811C67275dCA15A689c97b"
  const txFlowApi = null

  return useMemo(() => {
    if (!safeAddress || !chainId ) return

    return new SafeWalletProvider(
      {
        safeAddress,
        chainId: Number(chainId),
      },
      txFlowApi as any,
    )
  }, [safeAddress, chainId, txFlowApi])
}

export default useSafeWalletProvider