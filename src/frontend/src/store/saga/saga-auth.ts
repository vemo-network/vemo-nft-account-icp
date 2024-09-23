import {
  login,
  loginFailed,
  loginSuccess,
  logout,
  logoutFailed,
  logoutSuccess,
  refreshLogin,
} from "@store/auth-saga";
import { setLoading } from "@store/loading";
import dayjs from "dayjs";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import HttpService, { TokenName } from "src/services/http-service";
import SSOApiAsync from "src/services/sso-service";
import WalletService from "src/services/wallet-service";
import { ConnectStatus, WalletStatus } from "src/types/smart-wallet";
import { parseJwt } from "src/utils/formatting.utils";
import {
  getLocalStorageData,
  saveLocalStorageData,
} from "src/utils/storage.utils";

// function* changeNetworkAction({ payload }: ReturnType<typeof login>) {
//   try {
//     const account = yield call(getAccount)
//     const { chain } = yield call(getNetwork)
//     const address = account?.address ?? account?.account
//     const chainId = chain?.id?.toString()
//     const { connectorName, currentChainId, needSwitching, isLogin } = payload

//     selectedChainId = currentChainId
//     if (!isLogin) return

//     if (connectorName === ConnectWalletType.WALLET_CONNECT_V2 && isLogin) {
//       return yield call(logoutSaga, "logout")
//     }
//     const isSupportedChain = supportedChains.find((e) => e.id === Number(chainId))
//     if (!isSupportedChain && connectorName === ConnectWalletType.WALLET_CONNECT_V2) {
//       return yield call(disconnect)
//     }

//     if (needSwitching) {
//       try {
//         yield call(switchNetwork, { chainId: Number(currentChainId) })
//       } catch (error) {
//         return yield put(
//           addError({
//             error,
//           })
//         )
//       }
//     }

//     yield put(
//       setLoading({
//         isLoading: true,
//       })
//     )
//     yield processLogin({
//       address,
//       chainId,
//       connectorName,
//       needSwitching,
//     })
//   } catch (error) {
//     yield put(
//       setLoading({
//         isLoading: false,
//       })
//     )
//     yield put(loginFailed({ oauth: null, error })) // Dispatch failure action with error
//     yield call(disconnect)
//   }
// }
function* loginSaga({ payload }: ReturnType<typeof login>) {
  const { address, chainId, signMessage, disconnect } = payload;
  const connectStatus: string = yield getLocalStorageData(WalletStatus.SIGNING);
  try {
    if (connectStatus !== ConnectStatus.CONNECTING) {
      yield saveLocalStorageData(
        WalletStatus.SIGNING,
        ConnectStatus.CONNECTING
      );
      yield processLogin({
        address,
        chainId,
        signMessage,
      });
    }
    yield saveLocalStorageData(WalletStatus.SIGNING, ConnectStatus.FINISHED);
  } catch (error) {
    yield saveLocalStorageData(WalletStatus.SIGNING, ConnectStatus.FINISHED);
    yield put(
      setLoading({
        isLoading: false,
      })
    );
    yield call(disconnect);
    yield put(loginFailed({ oauth: null, error })); // Dispatch failure action with error
  }
}
function* processLogin({
  address,
  chainId,
  signMessage,
}: {
  address: string;
  chainId: string;
  signMessage: any;
}) {
  yield put(
    setLoading({
      isLoading: true,
    })
  );
  const ssoApiAsync = SSOApiAsync.getInstance();
  const vemoApiAsync = WalletService.getInstance();

  const dataGenerateChallenge: {
    challenge: any;
    hash: any;
  } = yield call(ssoApiAsync.generateChallenge, address, chainId);
  const signature: string = yield call(signMessage, {
    message: dataGenerateChallenge?.challenge,
  });

  const dataVerifyChallenge: {
    oauth: any;
  } = yield call(
    vemoApiAsync.verifyChallenge,
    dataGenerateChallenge?.hash,
    signature
  );
  const expTime = parseJwt(dataVerifyChallenge?.oauth?.access_token);

  HttpService.saveToken(
    TokenName.access_token,
    dataVerifyChallenge?.oauth?.access_token,
    dayjs.unix(expTime.exp ?? 0).toDate()
  );
  HttpService.saveToken(
    TokenName.refresh_token,
    dataVerifyChallenge?.oauth?.refresh_token,
    dayjs().add(7, "day").toDate()
  );

  const profile: {
    data: any;
  } = yield call(ssoApiAsync.getProfile);
  yield put(
    loginSuccess({
      oauth: dataVerifyChallenge?.oauth,
      wallet: address,
      chainId: chainId.toString(),
      dareId: profile?.data?.Dareid,
    })
  ); // Dispatch success action with data

  yield put(
    setLoading({
      isLoading: false,
    })
  );
  yield saveLocalStorageData(WalletStatus.SIGNING, ConnectStatus.CONNECTED);
}
function* logoutSaga({ payload }: any) {
  try {
    yield put(logoutSuccess("success"));
    HttpService.removeToken(TokenName.access_token);
  } catch (error) {
    yield put(logoutFailed({ oauth: null, error }));
  }
}

export const authSagas = [
  takeLatest(login.type, loginSaga),
  takeLatest(logout.type, logoutSaga),
  // takeLatest(refreshLogin.type, refresh),
];
