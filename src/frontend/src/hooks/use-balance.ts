import { ZeroAddress } from "ethers6";
import { useBalance } from "wagmi";
import { useAuthSaga } from "./use-auth";

export const useTokenBalance = (
  tokenAddress: string,
  account: string,
  queryParams?: any
): {
  balance: any;
  isLoading: boolean;
} => {
  if (tokenAddress === ZeroAddress) {
    return useEtherBalance(account);
  }
  const { chainId } = useAuthSaga();
  const { data, isLoading } = useBalance({
    address: account as any,
    token: tokenAddress as any,
    chainId: !!queryParams?.chainId ? Number(queryParams?.chainId) : chainId,
  });
  return {
    balance: BigInt(data?.value ?? 0),
    isLoading,
  };
};
export function useEtherBalance(
  address: string,
  queryParams?: any
): {
  balance: BigInt;
  isLoading: boolean;
  refetch: () => void
} {
  const { chainId } = useAuthSaga();
  const { data, isLoading, refetch } = useBalance({
    address: address as any,
    chainId: !!queryParams?.chainId ? Number(queryParams?.chainId) : chainId,
    
  });
  return {
    balance: BigInt(data?.value ?? 0),
    isLoading: isLoading,
    refetch
  };
}
