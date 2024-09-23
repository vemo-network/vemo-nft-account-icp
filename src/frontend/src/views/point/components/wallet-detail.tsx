import { PrimaryButton } from "@components/buttons/primary-button";
import CopyComponent from "@components/copy-component";
import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { WarningComponent } from "@components/state/warning-component";
import { setSelectChain } from "@store/global";
import SignClient from "@walletconnect/sign-client";
import Input from "antd/es/input";
import { Collapse } from "antd/lib";
import clsx from "clsx";
import { serializeError } from "eth-rpc-errors";
import { ethers, TypedDataEncoder } from "ethers6";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { BASE_PATH } from "src/configs/constants";
import { useAuthSaga } from "src/hooks/use-auth";
import { useEthersSigner } from "src/hooks/use-ether-provider";
import { TokenboundClient } from "src/sdk/src";
import { ButtonStyles } from "src/types/common.type";
import { Wallet } from "src/types/smart-wallet";
import { getChainById, getLinkExplorer } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import { utilsNotification } from "src/utils/notification-utils";
import SignClientFactory from "src/utils/sign-client";
import { getDecodedMessage, getPlatformName } from "src/utils/string.utils";
import { getPlatformIcon, getTbaAddress } from "src/utils/wallet.util";
import { Address, createWalletClient, custom, http, WalletClient } from "viem";
import { useSignMessage, useSignTypedData, useSwitchChain } from "wagmi";
import SelectAccount from "./detail-smartwallet-connected";
import TBAList from "./tba-wallets";
import { WalletDelegate } from "./wallet-delegate";
import { WalletPoint } from "./wallet-point";
import { WalletTokenBalances } from "./wallet-token-balances";

// import { ethers, TypedDataEncoder } from "ethers"

interface IWalletDetail {
  wallet_selected: Wallet | null;
  initWallet: (walletAddress: string) => void;
  openSelectAccount: () => void;
  setWalletSelected: (wallet: any) => void;
  // TODO: more types
}
export const signClientSingleton = new SignClientFactory();
let currentId = "";
let currentProposalId = "";
export const WalletDetail = ({
  wallet_selected,
  initWallet,
  openSelectAccount,
  setWalletSelected,
}: IWalletDetail) => {
  const [wallet, setWallet] = useState(wallet_selected);
  const ref = useRef(wallet_selected);

  useEffect(() => {
    !!wallet_selected && setWallet(wallet_selected);
    ref.current = wallet_selected;
  }, [wallet_selected]);
  const [signClientInstance, setSignClientInstance] =
    useState<SignClientFactory | null>(null);
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    signClientSingleton?.init().then(() => {
      setSignClientInstance(signClientSingleton);
      setSignClient(signClientSingleton.getSignClient());
      const sessions = signClientSingleton.getSignClient().session;
      if (sessions.length > 0) {
        try {
          // const currentSession = sessions.getAll()[0];
          // signClientInstance?.ping(currentSession.topic);
          // setSession(currentSession);
          // // signClientInstance?.extend(currentSession.topic)
          // const currentTba = currentSession.namespaces?.eip155?.accounts;
          // const tba = currentTba.length && currentTba[0].split(":")[2];
          // initWallet(tba as string);
        } catch (error) {}
      }
    });
  }, []);
  const { address, chain, chainId: connectedChainId } = useAuthSaga();
  const chainId = connectedChainId;
  const walletClient: WalletClient = createWalletClient({
    chain: chain,
    account: address,
    // transport: http(),
    transport: window.ethereum ? custom(window.ethereum) : http(),
  });
  const refChainId = useRef(connectedChainId);
  useEffect(() => {
    refChainId.current = connectedChainId;
  }, [connectedChainId]);
  const tokenboundClient = new TokenboundClient({
    walletClient,
    chainId: chainId,
    chain,
  });
  const tokenBoundRef = useRef(tokenboundClient);
  useEffect(() => {
    tokenBoundRef.current = tokenboundClient;
  }, [tokenboundClient]);

  const [tokenboundAccount, setTokenBoundAccount] = useState<Address | null>();
  useEffect(() => {
    setTokenBoundAccount(
      wallet?.tba_address ??
        (wallet &&
          getTbaAddress({
            chain_id: wallet?.chain_id,
            contract_address: wallet?.contract_address as any,
            token_id: wallet?.token_id?.toString(),
          }))
    );
  }, [wallet?.tba_address]);
  const [uri, setUri] = useState("");
  const [pendingConnect, setPendingConnect] = useState(false);

  let proposalID: number;
  const isConnectable = (!!wallet && !!uri) || !!session;
  const handleEventLogin = async (event: any, address: any) => {
    if (currentProposalId === event.id) {
      return;
    }
    currentProposalId = event.id;
    proposalID = event.id;
    const namespace = event.params.optionalNamespaces.eip155
      ? event.params.optionalNamespaces
      : event.params.requiredNamespaces;
    let newChains = [`eip155:${ref.current?.chain_id}`].concat(
      namespace.eip155.chains.filter(
        (e: any) => e !== `eip155:${ref.current?.chain_id}`
      )
    );
    let accounts = newChains.map(
      (e: string) => `${e}:${ref.current?.tba_address}`
    );
    namespace.eip155 = { ...namespace.eip155, accounts };
    try {
      const { topic, acknowledged } = await signClientInstance?.approve(
        proposalID,
        namespace
      )!;
      await signClientInstance?.chainChanged(
        topic,
        refChainId.current.toString()
      );
      const session = await acknowledged();
      if (session) {
        utilsNotification.success(`Connected`);
        setSession(session);
      }
    } catch (e) {
      console.error("handleEventLogin", e);
      setSession(undefined);
    } finally {
      setPendingConnect(false);
    }
  };
  const signer = useEthersSigner({
    chainId: chainId,
  });
  const refSigner = useRef(signer);
  useEffect(() => {
    if (signer) {
      refSigner.current = signer;
    }
  }, [signer, chainId]);
  const signdata = async (requestParams: any, message: string) => {
    if (!refSigner.current) {
      return;
    }
    const signedMessage = await refSigner.current?.signMessage(message);
    return signedMessage;
  };
  const { signTypedDataAsync } = useSignTypedData();
  const signdatav4 = async (message: string) => {
    if (!tokenboundAccount || !chainId || !signer) {
      return;
    }
    const jsonMsg = JSON.parse(message);
    const data = await signTypedDataAsync(jsonMsg);
    if (wallet?.wallet_collection.isDelegated) {
      const collection = wallet.wallet_collection.contractAddress;
      const domain = TypedDataEncoder.hashDomain(jsonMsg.domain);
      const { EIP712Domain, ...types } = jsonMsg.types;
      const typeData = new TypedDataEncoder(types);
      const typeDesc = typeData.encodeType(typeData.primaryType);
      const typeHash = ethers.id(typeDesc);
      return data + collection.slice(2) + domain.slice(2) + typeHash.slice(2);
    }
    return data;
  };
  const handleDisconnect = async (topic = "") => {
    signClientInstance
      ?.disconnect(!!topic ? topic : session.topic)
      .catch((e) => {
        setSession(null);
        setUri("");
      });
    setSession(null);
    setUri("");
  };
  const handleChangeAccount = async () => {
    await signClientInstance?.accountChanged(
      session?.topic,
      tokenboundAccount!,
      chainId?.toString()
    );
  };
  const currentTbaConnect = session?.namespaces?.eip155?.accounts[0];
  useEffect(() => {
    if (session && tokenboundAccount && currentTbaConnect && !pendingConnect) {
      // setSession(null);
      // setUri("");
      handleChangeAccount();
    }
  }, [signClientInstance, tokenboundAccount, currentTbaConnect]);
  const processEvent = async () => {};
  const handleExecuteEvent = async (
    event: any,
    signClientInstance: SignClientFactory
  ) => {
    const chainIdReq = event.params?.chainId.split(":")[1];
    const id = event.id;
    const topic = event.topic;
    // switch to creation chain
    const callData = event?.params?.request?.params[0];
    if (Number(refChainId.current) !== Number(ref.current?.chain_id)) {
      return switchChainAsync({
        chainId: Number(ref.current?.chain_id),
      }).then(async () => {
        try {
          const res = await tokenBoundRef.current.execute({
            data: callData.data,
            to: callData.to,
            account: callData.from,
            value: !!callData?.value ? callData?.value : "0",
            chainId: Number(chainIdReq),
            isDelegate: ref.current?.wallet_collection?.isDelegated,
            delegationContract: ref.current?.wallet_collection?.contractAddress,
          });
          if (res) {
            const response = {
              id,
              result: res,
              jsonrpc: "2.0",
            };
            return await signClientInstance?.respond({ topic, response });
          }
        } catch (error) {
          const customError: any = serializeError(error);
          await signClientInstance.respond({
            topic,
            response: {
              id,
              error: customError,
              jsonrpc: "2.0",
            },
          });
        }
      });
    }
    try {
      const res = await tokenBoundRef.current.execute({
        data: callData.data,
        to: callData.to,
        account: callData.from,
        value: !!callData?.value ? callData?.value : "0",
        chainId: Number(chainIdReq),
        isDelegate: ref.current?.wallet_collection?.isDelegated,
        delegationContract: ref.current?.wallet_collection?.contractAddress,
      });
      if (res) {
        const response = {
          id,
          result: res,
          jsonrpc: "2.0",
        };
        return await signClientInstance?.respond({ topic, response });
      }
    } catch (error) {
      const customError: any = serializeError(error);

      await signClientInstance.respond({
        topic,
        response: {
          id,
          error: customError,
          jsonrpc: "2.0",
        },
      });
    }
  };
  const handleSign = async (event: any, signClientInstance: any) => {
    const hexString = event?.params?.request.params[0];
    const id = event.id;
    const topic = event.topic;
    const chainIdReq = event.params?.chainId.split(":")[1];
    const decodedString = getDecodedMessage(hexString);
    if (Number(refChainId.current) !== Number(chainIdReq)) {
      return switchChainAsync({
        chainId: Number(chainIdReq),
      }).then(async () => {
        try {
          const signedMessage = await signdata(hexString, decodedString);
          if (signedMessage) {
            const response = {
              id,
              result: signedMessage,
              jsonrpc: "2.0",
            };
            return await signClientInstance?.respond({ topic, response });
          }
        } catch (error) {
          const customError: any = serializeError(error);
          await signClientInstance?.respond({
            topic,
            response: {
              id,
              error: customError,
              jsonrpc: "2.0",
            },
          });
        }
      });
    }
    try {
      const signedMessage = await signdata(hexString, decodedString);
      if (signedMessage) {
        const response = {
          id,
          result: signedMessage,
          jsonrpc: "2.0",
        };
        return await signClientInstance?.respond({ topic, response });
      }
    } catch (error) {
      const customError: any = serializeError(error);
      await signClientInstance?.respond({
        topic,
        response: {
          id,
          error: customError,
          jsonrpc: "2.0",
        },
      });
    }
  };
  const handleRequestEvent = async (event: any) => {
    if (!signClientInstance) {
      return;
    }
    const isCorrectEvent = !!session && event?.topic === session.topic;
    if (!isCorrectEvent && !!session) {
      return;
    }
    const id = event.id;
    const topic = event.topic;
    const chainIdReq = event.params?.chainId.split(":")[1];
    if (
      event?.params?.request?.method === "personal_sign" &&
      currentId !== id
    ) {
      currentId = id;
      handleSign(event, signClientInstance);
    }
    if (
      event?.params?.request?.method === "eth_sendTransaction" &&
      currentId !== id
    ) {
      currentId = id;
      //   const chainIdReq = event.params?.chainId.split(":")[1];
      //   // switch to creation chain
      //   console.log("chainIdReq", chainIdReq, wallet?.chain_id);
      //   const callData = event?.params?.request?.params[0];
      //   try {
      //     const res = await tokenboundClient.execute({
      //       data: callData.data,
      //       to: callData.to,
      //       account: callData.from,
      //       value: !!callData?.value ? callData?.value : "0",
      //       chainId: Number(chainIdReq),
      //     });
      //     if (res) {
      //       const response = {
      //         id,
      //         result: res,
      //         jsonrpc: "2.0",
      //       };
      //       return await signClientInstance?.respond({ topic, response });
      //     }
      //   } catch (error) {
      //     const customError: any = serializeError(error);
      //     console.log("customError", customError);
      //     await signClientInstance.respond({
      //       topic,
      //       response: {
      //         id,
      //         error: customError,
      //         jsonrpc: "2.0",
      //       },
      //     });
      //   }
      handleExecuteEvent(event, signClientInstance);
    }
    if (
      event?.params?.request?.method?.startsWith("eth_signTypedData") &&
      currentId !== id
    ) {
      const typedData = event?.params?.request?.params;
      currentId = id;
      try {
        const signedMessage = await signdatav4(typedData[1]);
        if (signedMessage) {
          const response = {
            id,
            result: signedMessage,
            jsonrpc: "2.0",
          };
          return await signClientInstance?.respond({ topic, response });
        }
      } catch (error) {
        const customError: any = serializeError(error);
        await signClientInstance?.respond({
          topic,
          response: {
            id,
            error: customError,
            jsonrpc: "2.0",
          },
        });
      }
    }
  };
  useEffect(() => {
    if (!signClientInstance || !session) {
      return;
    }
    signClientInstance.on("session_event", (event: any) => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    });

    return signClientInstance.on("session_request", handleRequestEvent);
  }, [signClientInstance, session]);
  useEffect(() => {
    if (signClientInstance && session) {
      signClientInstance.on("session_ping", (event: any) => {
        console.log("event", event);
        // React to session ping event
      });
      signClientInstance.on("session_update", (event: any) => {
        console.log("event", event);
        // React to session ping event
      });

      signClientInstance.on("session_delete", (event: any) => {
        // React to session delete event)
        handleDisconnect(event.topic);
      });

      signClientInstance.on("session_expire", (event: any) => {
        // React to session delete event)
        signClientInstance.extend(event.topic);
        // handleDisconnect(event.topic);
      });
      signClientInstance.on("proposal_expire", (event: any) => {
        // React to session delete event)'
        console.log("event", event);
        // handleDisconnect(session.topic);
        // signClientInstance.extend(event.topic);
      });
    }
  }, [signClientInstance, session]);
  const { switchChainAsync } = useSwitchChain();
  const processLogin = async (address: any) => {
    if (uri && signClientInstance) {
      await signClientInstance
        .getSignClient()
        .off("session_proposal", () => null);
      setPendingConnect(true);
      await signClientInstance?.connect(uri).catch((e) => {
        console.error("Error connecting", e);
        setPendingConnect(false);
        utilsNotification.error("Session expired. Please try with other URI");
      });

      signClientInstance
        ?.getSignClient()
        .on("session_proposal", (event: any) =>
          handleEventLogin(event, address)
        );
    }
  };
  const dispatch = useDispatch();

  const handleConnectUri = async (address: any) => {
    // if (chainId !== Number(wallet?.chain_id)) {
    //   return await switchChainAsync({
    //     chainId: Number(wallet?.chain_id),
    //   }).then(() => {
    //     const chainToSwitch = getChainById(wallet?.chain_id ?? 1);
    //     dispatch(setSelectChain(chainToSwitch));

    //     processLogin(address);
    //   });
    // }
    return processLogin(address);
  };
  const renderAction = () => {
    if (session) {
      const dapp = session?.peer?.metadata;
      const dappDetail = getPlatformName(dapp);
      const iconLink = dapp?.icons?.length ? dapp?.icons[0] : "";
      const isHttpLink = iconLink?.startsWith("http");
      return (
        <div className="flex gap-2 w-full">
          <div className="relative w-full text-xxs flex items-center bg-connect-box rounded-[8px] px-3 justify-between">
            <div className="flex gap-2 items-center">
              {!!iconLink && (
                <>
                  {isHttpLink ? (
                    <ImageComponent
                      src={dapp?.icons[0]}
                      width={24}
                      height={24}
                      alt="dapp-connecting"
                      httpLink={true}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: iconLink,
                      }}
                      className="w-6 h-6"
                    ></div>
                  )}
                </>
              )}

              <p className="text-sm font-normal truncate">
                {dappDetail?.title}
              </p>
            </div>
            <div className="flex gap-1 items-center font-normal ml-2">
              <p className="text-sm text-green-100 hidden sm:block">
                Connected
              </p>
              <ImageComponent
                src="/icons/status/connected.svg"
                width={20}
                height={20}
                alt="connected-icon"
              />
            </div>
          </div>
          <PrimaryButton
            onClick={() => handleDisconnect()}
            label="Disconnect"
            color={ButtonStyles.SECONDARY}
            className="!h-10 sm:max-w-[100px] bg-dark-800 "
            disabled={!isConnectable}
          />
        </div>
      );
    }
    const handlePaste = async (e: any) => {
      navigator.clipboard.readText().then((data: string) => {
        setUri(data);
      });
    };
    return (
      <div className="flex gap-2 w-full">
        <div className="relative w-full text-xxs">
          <Input
            className="bg-blue-500 h-10 rounded-[8px]  px-3 text-sub-text pr-[50px]"
            onChange={(e) => setUri(e.target.value)}
            placeholder="Copy the connection code here"
            prefix={
              <ImageComponent
                src="/icons/wallet-connect.svg"
                className="mr-2"
                width={24}
                height={24}
                alt="wc"
              />
            }
            value={uri}
          />
          <span
            className="absolute right-[12px] top-[10px] cursor-pointer z-10"
            onClick={handlePaste}
          >
            Paste
          </span>
        </div>
        <PrimaryButton
          onClick={() => handleConnectUri(tokenboundAccount)}
          label="Connect"
          color={ButtonStyles.SUCCESS}
          className="!h-10 max-w-[100px] !text-16px"
          disabled={!isConnectable}
          loading={pendingConnect}
        />
      </div>
    );
  };
  const tbaChain = getChainById(wallet?.tbaChain ?? wallet?.chain_id ?? 1);
  return (
    <div className="flex flex-col w-full" id="wallet-detail">
      <div className={clsx(wallet ? "mt-0" : "mt-0 lg:mt-[-45px]")}>
        {/* <TBAList wallet={wallet} setWallet={setWallet} /> */}

        <div className=" rounded-lg px-4 pb-4 pt-4 sm:pt-0">
          {/* <div className="flex justify-between">
            <p className={clsx("block  py-2 relative whitespace-nowrap")}>
              TBA Chain
            </p>
            <div className="bg-grey-800 rounded-md w-2/3 h-10 flex gap-2 text-md font-normal items-center pl-2">
              <RenderChainIcon
                chainId={tbaChain?.id ?? 1}
                width={20}
                height={20}
              />
              {tbaChain?.name}
            </div>
          </div> */}
          <div className="flex justify-between flex-col">
            <div className="flex  py-3">
              <p
                className={clsx(
                  "flex gap-2 elative whitespace-nowrap leading-[24px]"
                )}
              >
                Connect this account to DApp(s)
              </p>
            </div>
            {renderAction()}
          </div>
          <WalletPoint point={wallet?.krystal_point ?? "0"} />
          {wallet && (
            <WalletDelegate
              wallet={wallet}
              openSelectAccount={openSelectAccount}
              setWalletSelected={setWalletSelected}
            />
          )}{" "}
          <WarningComponent />
          {wallet && <WalletTokenBalances walletSelected={wallet} />}{" "}
        </div>
      </div>
    </div>
  );
};
