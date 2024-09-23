import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import SignClient from "@walletconnect/sign-client";
import { Button, Input } from "antd";
import { serializeError } from "eth-rpc-errors";
import type { TypedDataDomain } from "ethers";
import { getBytes, hashMessage, TypedDataEncoder } from "ethers6";
import React, { useEffect, useState } from "react";
import {
  useEthersProvider,
  useEthersSigner,
} from "src/hooks/use-ether-provider";
import { TokenboundClient } from "src/sdk/src";
import { getDecodedMessage } from "src/utils/string.utils";
import { createWalletClient, WalletClient } from "viem";
import { signMessage } from "viem/actions";
import { arbitrum, avalanche, avalancheFuji } from "viem/chains";
import {
  custom,
  http,
  useAccount,
  useChainId,
  useDisconnect,
  useSignMessage,
} from "wagmi";
import SignClientFactory from "../utils/sign-client";
import { config, wagmiConfig } from "../wagmi";

const signClientSingleton = new SignClientFactory();

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

const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types;
  return TypedDataEncoder.hash(
    typedData.domain as any,
    types,
    typedData.message
  );
};
const tokenConfig = {
  [arbitrum.id]: "0xd022977a22f9a681Df8F3c51ed9ad144BDc5bb38",
  [avalancheFuji.id]: "0x3AB767b08Efb6b05D20b32C4B1f316b4836C8cA6",
};
export function Account() {
  const { disconnect } = useDisconnect();
  const { address, isConnected, connector, chain } = useAccount();
  const [uri, setUri] = useState("");
  let proposalID: number;
  const contractAddress = "0xYourSmartContractAddress"; // Replace with your deployed contract address
  const abi = [
    "function isValidSignature(bytes32 hash, bytes memory signature) public view returns (bytes4)",
  ];
  const chainId = useChainId();
  const walletClient: WalletClient = createWalletClient({
    chain: chain,
    account: address,
    // transport: http(),
    transport: window.ethereum ? custom(window.ethereum) : http(),
  });
  const TOKEN_CONTRACT = (tokenConfig as any)[chainId as number];

  const tokenboundClient = new TokenboundClient({
    walletClient,
    chainId: chainId,
    implementationAddress: "0x354C2fe546d6890a5132afa10d41620f118703Ad",
    registryAddress: "0xa3937233d889c16d032fCaec16B3EE2690E2CE1A",
    chain,
  });
  const [tokenId, setTokenId] = useState("");

  const [tokenboundAccount, setTokenBoundAccount] = useState("");
  useEffect(() => {
    tokenId &&
      setTokenBoundAccount(
        // tokenboundClient.getAccount({
        //   tokenContract: TOKEN_CONTRACT,
        //   tokenId: tokenId,
        //   chainId,
        // })
        "0x4e39d61f97039716af8628feb885bc8384ad7196"
      );
  }, [tokenId]);
  console.log("tokenboundAccount :>> ", tokenboundAccount);
  const [signClientInstance, setSignClientInstance] =
    useState<SignClientFactory | null>(null);
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  useEffect(() => {
    signClientSingleton?.init().then(() => {
      setSignClientInstance(signClientSingleton);
      setSignClient(signClientSingleton.getSignClient());
    });
  }, []);
  console.log("signClient :>> ", signClient);

  const [session, setSession] = useState<any>();
  console.log("session :>> ", session);
  useEffect(() => {
    if (signClient && tokenboundAccount) {
      signClient.once("session_proposal", async (event: any) => {
        console.log("event", event);
        proposalID = event.id;

        const namespace = event.params.optionalNamespaces.eip155 ? event.params.optionalNamespaces : event.params.requiredNamespaces;
        const accounts = namespace.eip155.chains.map(
          (e: string) => `${e}:${tokenboundAccount}`
        );
        namespace.eip155 = { ...namespace.eip155, accounts };

        const { topic, acknowledged } = await signClient.approve({
          id: proposalID,
          namespaces: namespace,
        });

        // Optionally await acknowledgement from dapp
        const session = await acknowledged();
        setSession(session);
        console.log("connected section ", session);
      });
    }
  }, [signClient, tokenboundAccount]);
  const signer = useEthersSigner({
    chainId: chainId ?? avalancheFuji.id,
  });
  console.log("tokenboundAccount", tokenboundAccount);
  const signdata = async (requestParams: any, message: string) => {
    console.log("tokenboundAccount", tokenboundAccount, chainId, signer);
    if (!tokenboundAccount || !chainId || !signer) {
      return;
    }
    // const provider: any = await connector?.getProvider();
    const domain = {
      name: "Vemo",
      version: "1",
      chainId: chainId.toString(), // Replace with the appropriate chain ID
      verifyingContract: tokenboundAccount, // Replace with your contract address
    };
    const types = {
      SafeMessage: [{ name: "message", type: "bytes" }],
    };
    const signMessage = {
      message: hashMessage(message),
    };
    const hashData = hashTypedData({
      domain,
      types,
      message: signMessage,
    });
    // const params = [message, tokenboundAccount];
    console.log("hashData", hashData);
    // Sign the message using personal_sign
    const signedMessage = await signer?.signMessage(getBytes(hashData));
    console.log("signedMessage :>> ", signedMessage);
    return signedMessage;
  };
  const { signMessageAsync } = useSignMessage();
  const signdatav4 = async (message: string) => {
    console.log("message :>> ", message);
    const data = await signMessageAsync({
      message,
    });
    return data;
  };
  useEffect(() => {
    console.log("signClient :>> ", signClient);
    if (signClient) {
      signClient.on("session_event", (event: any) => {
        // Handle session events, such as "chainChanged", "accountsChanged", etc.
        console.log("session_event ", event);
      });

      signClient.on("session_request", async (event: any) => {
        console.log("session_request ", event);
        const id = event.id;
        const topic = event.topic;
        if (event?.params?.request?.method === "personal_sign") {
          const hexString = event?.params?.request.params[0];
          // Decode the hex string to ASCII
          const decodedString = getDecodedMessage(hexString);
          console.log("decodedString :>> ", decodedString);
          try {
            const signedMessage = await signdata(hexString, decodedString);
            if (signedMessage) {
              const response = {
                id,
                result: signedMessage,
                jsonrpc: "2.0",
              };
              return await signClient?.respond({ topic, response });
            }
          } catch (error) {
            console.log("error :>> ", error);
            const customError: any = serializeError(error);
            await signClient.respond({
              topic,
              response: {
                id,
                error: customError,
                jsonrpc: "2.0",
              },
            });
          }
        }
        if (event?.params?.request?.method === "eth_sendTransaction") {
          const callData = event?.params?.request?.params[0];
          try {
            await tokenboundClient.execute({
              data: callData.data,
              to: callData.to,
              account: callData.from,
              value: callData.value,
            });
          } catch (error) {
            console.log("error :>> ", error);

            const customError: any = serializeError(error);

            await signClient.respond({
              topic,
              response: {
                id,
                error: customError,
                jsonrpc: "2.0",
              },
            });
          }
        }
      });

      signClient.on("session_ping", (event: any) => {
        // React to session ping event
      });
      signClient.on("session_update", (event: any) => {
        console.log("session_update :>> ", event);
        // React to session ping event
      });

      signClient.on("session_delete", (event: any) => {
        console.log("session_delete event :>> ", event);
        // React to session delete event
      });
    }
  }, [signClient, tokenboundAccount]);

  /*
    has not specified which wallet to connect
    the current UI must act as a wallet 
  */
  console.log("signClient :>> ", signClient);
  const handleConnectUri = async () => {
    console.log("signClient :>> ", signClient);
    if (uri && signClient) {
      const res = await signClient.core.pairing.pair({ uri });
      console.log("res :>> ", res);
    }
  };
  const handleLogout = async () => {
    disconnect();
  };

  return (
    <div>
      <div className="">
        <div className="flex gap-2 flex-col">
          <Input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="Paste WalletConnect URI"
          />
          <Button onClick={handleConnectUri}>Connect via URI</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <Input
          placeholder="input token id"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        {"tokenboundAccount"}: {tokenboundAccount}
      </div>
    </div>
  );
}
