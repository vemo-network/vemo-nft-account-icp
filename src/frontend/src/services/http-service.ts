import axios, { AxiosInstance, AxiosResponse } from "axios";
import cookies from "js-cookie";
import { needRefresh, processRefreshRequest } from "src/api";

export enum AuthType {
  Basic,
  Bearer,
  ///...
}

export enum ApiName {
  SSO,
  Notification,
}

export enum TokenName {
  access_token = "access_token",
  refresh_token = "refresh_token",
  current_signing = "current_signing",
}

export default class HttpService {
  protected readonly instance: AxiosInstance;
  public constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 15000,
    });
    this._initializeResponseInterceptor();
  }

  protected _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  protected _handleResponse = ({ data }: AxiosResponse) => {
    return data;
  };

  protected _handleError = async (error: any) => {
    if (needRefresh(error)) {
      const originalRequest = error;
      return await processRefreshRequest(originalRequest);
    }

    return Promise.reject(error);
  };

  static saveToken(name: string, value: string, expires?: Date) {
    cookies.set(name, value, {
      path: "/",
      expires,
    });
  }

  static getToken(name: string) {
    return cookies.get(name);
  }

  static removeToken(name: string) {
    cookies.remove(name, {
      path: "/",
    });
  }
  static getConnectorName() {
    return JSON.parse(localStorage.getItem("wagmi.wallet") ?? 'null');
  }

  
}

const getAuthConfig = (type: AuthType, apiName: ApiName) => {
  let config = {};
  if (type === AuthType.Basic) {
    config = {
      auth: {
        username: import.meta.env.VITE_SSO_BASIC_AUTH_USERNAME,
        password: import.meta.env.VITE_SSO_BASIC_AUTH_PASSWORD,
      },
    };
  }

  if (type === AuthType.Bearer) {
    const accessToken = HttpService.getToken(TokenName.access_token);
    config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return config;
};

export function useAuth(type: AuthType, apiName: ApiName = ApiName.SSO) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    let originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const config = getAuthConfig(type, apiName);
      args.push(config);
      let result = originalMethod.apply(this, args);
      return result;
    };
  };
}
