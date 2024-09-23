import { ChainId } from "@pancakeswap/chains";
import { Currency, Native, Token, WNATIVE } from "@pancakeswap/sdk";

export * from "./getTokensByChain";

/**
 * An empty result, useful as a default.
 */

export function serializeTokens(unserializedTokens: any) {
  const serializedTokens = Object.keys(unserializedTokens).reduce(
    (accum, key) => {
      return { ...accum, [key]: unserializedTokens[key].serialize };
    },
    {} as any
  );

  return serializedTokens;
}

export function unwrappedToken(token?: Token): Currency | undefined {
  if (token && token.equals(WNATIVE[token.chainId as keyof typeof WNATIVE]))
    return Native.onChain(token.chainId);
  return token;
}
