import { ethers, ZeroAddress } from "ethers6";
import { FC, PropsWithChildren, ReactNode, useEffect } from "react";
import { useAuthSaga } from "src/hooks/use-auth";
import { useTokenAllowance } from "src/hooks/use-token-allowance";
import { Address } from "viem";

export interface ApprovedCurrencyCheckProps {
  token: Address;
  value: BigInt;
  spender: Address;
  loading?: boolean;
  fallback?: ReactNode;
}

export const ApprovedCurrencyCheck: FC<
  PropsWithChildren<ApprovedCurrencyCheckProps>
> = (props) => {
  const { address } = useAuthSaga();
  const { maximumAmount, refetch } = useTokenAllowance(
    props.token,
    address as Address,
    props.spender
  );

  useEffect(() => {
    refetch();
  });
  // ignore with native token
  if (props.token === ZeroAddress) {
    return <>{props.children}</>;
  }

  if (maximumAmount === undefined) {
    return <>{props.loading}</>;
  }

  if (maximumAmount >= props.value) {
    return <>{props.children}</>;
  }

  return <>{props.fallback}</>;
};
