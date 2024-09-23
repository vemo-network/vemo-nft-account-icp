import { TypedDataDomain } from "ethers";
import { isHexString, toUtf8String, TypedDataEncoder } from "ethers6";

interface TypedDataTypes {
  name: string;
  type: string;
}

type TypedMessageTypes = {
  [key: string]: TypedDataTypes[];
};

export type EIP712TypedData = {
  domain: TypedDataDomain;
  types: TypedMessageTypes;
  message: Record<string, unknown>;
};

export const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types;
  return TypedDataEncoder.hash(
    typedData.domain as any,
    types,
    typedData.message
  );
};

export const getDecodedMessage = (message: string): string => {
  if (isHexString(message)) {
    // If is a hex string we try to extract a message
    try {
      return toUtf8String(message);
    } catch (e) {
      // the hex string is not UTF8 encoding so we will return the raw message.
    }
  }

  return message;
};

const listProject = [
  {
    name: "vemo",
    title: "Vemo",
  },
  {
    name: "opensea",
    title: "OpenSea",
  },
  {
    name: "pendle",
    title: "Pendle finance",
  },
  {
    name: "krystal",
    title: "Krystal",
  },
];

export const getPlatformName = (peerData: {
  description: string;
  name: string;
  url: string;
}) => {
  const { description, name, url } = peerData;
  const displayName = name;
  return (
    listProject.find((e) => {
      const isProject =
        description?.toLowerCase()?.includes(e.name) ||
        name?.toLowerCase()?.includes(e.name) ||
        url?.toLowerCase()?.includes(e.name);
      if (isProject) {
        return e;
      }
    }) ?? {
      title: displayName,
    }
  );
};
