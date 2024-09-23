import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export function useTokenAllowance(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address
): {
  maximumAmount: BigInt;
  refetch: () => void;
} {
  const { data, refetch } = useReadContract(
    tokenAddress && ownerAddress && spenderAddress
      ? {
          address: tokenAddress as Address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [ownerAddress, spenderAddress],
        }
      : undefined
  );

  if (!data)
    return {
      maximumAmount: BigInt(0),
      refetch: refetch,
    };

  return {
    maximumAmount: BigInt(data) ?? BigInt(0),
    refetch: refetch,
  };
}
