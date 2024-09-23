import HttpService, { AuthType, useAuth } from "./http-service";
import qs from "query-string";
import { ChainConfigData, EventsName, IERC20, IEventData, ITBA, ITokenConfig, Wallet, WalletsResponse } from "src/types/smart-wallet";
import api from "src/api";
import { getMarketUrl } from "src/utils/get-url";
import { IToken } from "src/types/token.types";
import { Collection, IPlatform } from "src/types/platform.type";
import { Address } from "viem";
import { ChainId } from "src/configs/constants/chain";

const branch = import.meta.env.VITE_PROJECT_TYPE !== "PROD" ? 'develop':'main'
export default class WalletService extends HttpService {
  private static classInstance?: WalletService;

  private constructor() {
    super(import.meta.env.VITE_API_SERVICE_URL);
  }

  public static getInstance() {
    if (!this.classInstance) {
      this.classInstance = new WalletService();
    }
    return this.classInstance;
  }
  @useAuth(AuthType.Bearer)
  async getWallets(params: {
    wallet_address: string;
    chain_id: string;
    platform_id?: number;
    offset?: number;
    tba_address?: string;
    sort?: { createdAt?: string; unitPriceUsd?: string } | string; // "DESC" | "ASC"
    filter?:
      | {
          providers?: string[];
          price?: { currency?: string; from?: number; to?: number };
          nftName?: string;
        }
      | string;
  },   ...args: any[]
) {
    const config = [...args].pop()

    if (params?.filter) {
      params.filter = JSON.stringify(params.filter);
    }
    if (params?.sort) {
      params.sort = JSON.stringify(params.sort);
    }
    const res: Wallet[] = await this.instance.get(
      `/wallet/get-wallets?${qs.stringify(params)}`,config
    );
    return res;
  }
  @useAuth(AuthType.Bearer)
  async getMintInfo(params: {
    chain_id: number;
    requester_address: string;
    collection_address: string;
  }, ...args: any[]): Promise<{
    tokenUri: string;
  }> {
    const config = [...args].pop()

    return await this.instance.get(
      `/wallet/get-mint-info?${qs.stringify(params)}`,config
    );
  }
  verifyChallenge(hash: string, signature: string) {
    return api.post(getMarketUrl(`user/verify-challenge`), {
      hash,
      signature,
    })
  }

  @useAuth(AuthType.Bearer)
  async getTokenBalance(params: {
    chainId: number;
    address: string;
  },...args: any[]): Promise<IToken[]> {
    const config = [...args].pop()

    return await this.instance.get(
      `/wallet/token-balance?${qs.stringify(params)}`,config
    );
  }

  @useAuth(AuthType.Bearer)
  async handleEvent(body: {
    event_type: EventsName;
    chain_id: number;
    data: IEventData
  },...args: any[]): Promise<IToken[]> {
    const config = [...args].pop()

    return await this.instance.post(
      `/handle-event`, body,config
    );
  }

  async getPlatforms ():Promise<{
    result: IPlatform[],
    count: number
  }> {
    return await this.instance.get('/platform/list-all')
  }

  async getConfigs (chainId: ChainId):Promise<ChainConfigData> {
    // return await this.instance.get('/config/chain_config')
    return (await fetch(`https://raw.githubusercontent.com/vemo-network/configs/${branch}/${chainId}/chain-config.json`)).json()
  }

  async getTokensConfig ():Promise<ITokenConfig> {
    // return await this.instance.get('/config/chain_config')
    return (await fetch(`https://raw.githubusercontent.com/vemo-network/configs/${branch}/tokens/all-tokens.json`)).json()
  }

  async getCollectionDetail ({
    chainId
  }:{
    chainId: number| string
  }):Promise<Collection> {
    return await this.instance.get(`/wallet/get-collection/${chainId}`)
  }

  @useAuth(AuthType.Bearer)
  async importToken(body: {
    wallet_address: Address;
    chain_id: number;
    token_address: Address
  },...args: any[]): Promise<IERC20> {
    const config = [...args].pop()

    return await this.instance.post(
      `/wallet/import-token`, body,config
    );
  }

  @useAuth(AuthType.Bearer)
  async getTokenImported(params: {
    chain_id: number;
    wallet_address: Address;
  },...args: any[]): Promise<IERC20[]> {
    const config = [...args].pop()

    return await this.instance.get(
      `/wallet/wallet-token?${qs.stringify(params)}`,config
    );
  }

  @useAuth(AuthType.Bearer)
  async executeSubQuery(body: {
    subquery: string;
    chain_id: number;
  },...args: any[]): Promise<{
    wallets: {
      nodes:ITBA[]
    }
  }> {
    const config = [...args].pop()

    return await this.instance.post(
      `/wallet/subquery`, body,config
    );
  }
}
