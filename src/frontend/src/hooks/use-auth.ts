import { login, logout } from "@store/auth-saga";
import { setSelectChain } from "@store/global";
import { RootState } from "@store/index";
import { serializeError } from "eth-rpc-errors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import HttpService, { TokenName } from "src/services/http-service";
import { ConnectStatus, WalletStatus } from "src/types/smart-wallet";
import { getChainById } from "src/utils/chain.utils";
import { getLocalStorageData } from "src/utils/storage.utils";
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import useIsTabActive from "./use-check-active-tab";
import { useSelectedChain } from "./use-config";

const useGetConnectedAddress = () => {
  const auth = useSelector((state: RootState) => state.authSaga);
  return auth.wallet;
};

export const useAuthSaga = () => {
  const chainId = useChainId();
  const { chain, address, connector, isDisconnected, status } = useAccount();
  return {
    chainId,
    chain,
    address,
    connector,
    isDisconnected,
    status,
  };
};
export const useLogout = () => {
  const refreshToken =
    HttpService && HttpService.getToken(TokenName.refresh_token);
  const connectingAddress = useGetConnectedAddress();

  const { disconnect } = useDisconnect();
  const dispatch = useDispatch();
  const { address, chainId } = useAuthSaga();

  useEffect(() => {
    if (!refreshToken && connectingAddress && address) {
      disconnect();
      dispatch(logout("logout"));
    }
  }, [refreshToken, connectingAddress, address]);
};

export const useLogin = () => {
  const selectChain = useSelectedChain();
  const { address, chainId, isDisconnected, chain, status } = useAuthSaga();
  const connectingAddress = useGetConnectedAddress();
  const { switchChainAsync, isPending } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const dispatch = useDispatch();
  const isActive = useIsTabActive();
  const { disconnect } = useDisconnect();
  const connectStatus = getLocalStorageData(WalletStatus.SIGNING);
  const loginAction = (...rest: any) => {
    return switchChainAsync({
      chainId: selectChain?.id ?? 1,
    }).then(() => {
      return signMessageAsync(rest[0]);
    });
  };
  const refChainId = useRef(selectChain?.id?.toString() ?? chainId?.toString());
  useEffect(() => {
    refChainId.current = selectChain?.id?.toString() ?? chainId?.toString();
  }, [selectChain, chainId]);
  const handleLogin = () => {
    connectStatus !== ConnectStatus.CONNECTING &&
      dispatch(
        login({
          address,
          chainId: refChainId.current,
          signMessage: loginAction,
          disconnect,
        })
      );
  };
  const handleSwitchChain = useCallback(async () => {
    !isPending &&
      !!isActive &&
      (await switchChainAsync({
        chainId: selectChain?.id ?? 1,
      }).catch((e) => {
        const formatError = serializeError(e);
        if (formatError.code === 4001) {
          dispatch(setSelectChain(chain));
        }
      }));
  }, [selectChain, isPending, chain, isActive]);
  useMemo(() => {
    if (
      chain?.id !== selectChain?.id &&
      chain &&
      selectChain &&
      status === "connected" &&
      !!connectingAddress
    ) {
      handleSwitchChain();
    }
  }, [selectChain, chain, status, connectingAddress]);
  // useEffect(() => {
  //   if (
  //     !!address &&
  //     address?.toLowerCase() !== connectingAddress?.toLowerCase()
  //   ) {
  //     handleLogin();
  //   }
  // }, [address, chainId, connectingAddress]);
};

export const useCheckLogin = () => {
  const { address, chainId } = useAuthSaga();
  const connectingAddress = useGetConnectedAddress();
  const { signMessageAsync } = useSignMessage();
  const dispatch = useDispatch();
  const { disconnect } = useDisconnect();

  const wrapAction = useCallback(
    async (callback: any) => {
      if (!connectingAddress) {
        return dispatch(
          login({
            address,
            chainId: chainId?.toString(),
            signMessage: signMessageAsync,
            disconnect,
          })
        );
      }
      return await callback;
    },
    [chainId, address, connectingAddress, signMessageAsync]
  );
  return {
    wrapAction,
  };
};
