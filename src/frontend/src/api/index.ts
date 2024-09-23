import { logout, refreshLoginSuccess } from "@store/auth-saga";
import { disconnect } from "@wagmi/core";
import axios from "axios";
import dayjs from "dayjs";
import HttpService, { TokenName } from "src/services/http-service";
import store from "src/store";
import { parseJwt } from "src/utils/formatting.utils";

let isRefreshing = false;
let refreshSubscribers: any[] = [];
let retryAttempts = 0;
const maxRetryAttempts = 2;
const instance = axios.create({
  timeout: 15000,
});
export function needRefresh(error: any) {
  const statusCode = error?.response?.status;
  // const message = error?.response?.data?.message
  return statusCode === 401;
}

export async function processRefreshRequest(originalRequest: any) {
  if (!isRefreshing) {
    if (retryAttempts < maxRetryAttempts) {
      isRefreshing = true;
      retryAttempts++;

      const headerData = originalRequest?.config?.headers;
      const refreshToken = headerData?.Cookie?.refreshToken?.value;
      const fallbackRefreshToken = HttpService.getToken("refresh_token");

      try {
        const res: any = await axios.post(
          `${import.meta.env.VITE_API_SERVICE_URL}user/refresh-token`,
          {
            refresh_token: refreshToken ?? fallbackRefreshToken,
          }
        );
        const expTime = parseJwt(res?.data.access_token);
        if (res) {
          HttpService.saveToken(
            TokenName.access_token,
            res?.data.access_token,
            dayjs()
              .add(expTime.exp ?? 0)
              .toDate()
          );
          HttpService.saveToken(
            TokenName.refresh_token,
            res.data.refresh_token,
            dayjs().add(14, "day").toDate()
          );
          store.dispatch(
            refreshLoginSuccess({
              oauth: {
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token,
              },
            })
          );
          originalRequest.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          // // Retry the original request
          refreshSubscribers.forEach((subscriber) =>
            subscriber(res.data.access_token)
          );
          refreshSubscribers = [];
          isRefreshing = false;
          retryAttempts = 0;
          return instance(originalRequest.config);
        }
      } catch (error: any) {
        isRefreshing = false;
        const errorResponseData = error?.response?.data;
        const errCode = errorResponseData.statusCode;
        if (Number(errCode) === 400 || error?.response?.status === 400) {
          store.dispatch(logout("logout"));
          // disconnect()
        }
        return {
          data: {
            statusCode: 400,
            message: errorResponseData,
          },
        };
      }
    }
  } else {
    // Wait and retry the original request after token refresh is done
    return new Promise((resolve) => {
      refreshSubscribers?.push((accessToken: any) => {
        originalRequest.config.headers.Authorization = `Bearer ${accessToken}`;
        resolve(instance(originalRequest.config));
      });
    });
  }
}

instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (needRefresh(error)) {
      // Token refresh logic
      const originalRequest = error;
      return await processRefreshRequest(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default instance;
