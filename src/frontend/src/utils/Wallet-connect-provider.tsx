import { useEffect, useState, type ReactNode } from "react";
import { formatJsonRpcError } from "@walletconnect/jsonrpc-utils";
import { getSdkError } from "@walletconnect/utils";
import { asError } from "./error.util";
import { WalletConnectContext } from "../context/wallet-context";
import WalletConnectWallet, { stripEip155Prefix } from "./WalletConnect";
import { getPeerName, trackRequest } from "./wallet.util";
import useSafeWalletProvider from "../hooks/use-wallet-provider";
import { useChainId } from "wagmi";

const IS_PRODUCTION = false;

enum Errors {
  WRONG_CHAIN = "%%dappName%% made a request on a different chain than the one you are connected to",
}

export enum WCLoadingState {
  APPROVE = "Approve",
  REJECT = "Reject",
  CONNECT = "Connect",
  DISCONNECT = "Disconnect",
}

const walletConnectSingleton = new WalletConnectWallet();

const getWrongChainError = (dappName: string): Error => {
  const message = Errors.WRONG_CHAIN.replace("%%dappName%%", dappName);
  return new Error(message);
};

export const WalletConnectProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const chainId = useChainId().toString();
  const { safe, safeAddress } = {
    safeAddress: "",
    safe: {
      chainId: chainId,
      name: "",
    },
  };
  const [walletConnect, setWalletConnect] =
    useState<WalletConnectWallet | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<WCLoadingState>();
  const safeWalletProvider = useSafeWalletProvider();

  // Init WalletConnect
  useEffect(() => {
    walletConnectSingleton
      .init()
      .then(() => setWalletConnect(walletConnectSingleton))
      .catch(setError);
  }, []);

  // Update chainId/safeAddress
  useEffect(() => {
    if (!walletConnect || !chainId || !safeAddress) return;

    walletConnect.updateSessions(chainId, safeAddress).catch(setError);
  }, [walletConnect, chainId, safeAddress]);

  // Subscribe to requests
  useEffect(() => {
    if (!walletConnect || !safeWalletProvider || !chainId) return;

    return walletConnect.onRequest(async (event: any) => {
      if (!IS_PRODUCTION) {
        console.log("[WalletConnect] request", event);
      }

      const { topic } = event;
      const session = walletConnect
        .getActiveSessions()
        .find((s: any) => s.topic === topic);
      const requestChainId = stripEip155Prefix(event.params.chainId);

      // Track requests
      if (session) {
        trackRequest(session.peer.metadata.url, event.params.request.method);
      }

      const getResponse = () => {
        // Get error if wrong chain
        if (!session || requestChainId !== chainId) {
          if (session) {
            setError(getWrongChainError(getPeerName(session.peer)));
          }

          const error = getSdkError("UNSUPPORTED_CHAINS");
          return formatJsonRpcError(event.id, error);
        }

        // Get response from Safe Wallet Provider
        return safeWalletProvider.request(event.id, event.params.request, {
          url: session.peer.metadata.url,
          name: getPeerName(session.peer) || "WalletConnect",
          description: session.peer.metadata.description,
          iconUrl: session.peer.metadata.icons[0],
        });
      };

      try {
        const response = await getResponse();

        // Send response to WalletConnect
        await walletConnect.sendSessionResponse(topic, response);
      } catch (e) {
        setError(asError(e));
      }
    });
  }, [walletConnect, chainId, safeWalletProvider]);

  return (
    <WalletConnectContext.Provider
      value={{
        walletConnect,
        error,
        setError,
        open,
        setOpen,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};
