import React from "react";
import { ChainId } from "src/configs/constants/chain";
import { ImageComponent } from "./render-image";

export const RenderChainIcon = ({
  chainId,
  width,
  height,
  ...rest
}: {
  chainId: ChainId;
  width: number;
  height: number;
}) => {
  if (chainId === 0) {
    return null;
  }
  switch (chainId) {
    case ChainId.AVALANCHE:
    case ChainId.AVALANCHE_TESTNET:
      return (
        <ImageComponent
          src="/icons/avalanche-chain.svg"
          width={width}
          height={height}
          alt="avalanche-icon"
        />
      );
    case ChainId.BSC:
    case ChainId.BSC_TESTNET:
      return (
        <ImageComponent
          src="/icons/bnb-chain.svg"
          width={width}
          height={height}
          alt="bnb-icon"
        />
      );
    case ChainId.ARB:
    case ChainId.ARB_SEPOLIA:
      return (
        <ImageComponent
          src="/icons/arbitrum-logo.png"
          width={width}
          height={height}
          alt="bnb-icon"
        />
      );

    default:
      return (
        <ImageComponent
          src="/icons/ethereum-chain.png"
          width={width}
          height={height}
          alt="avalanche-icon"
        />
      );
  }
};
