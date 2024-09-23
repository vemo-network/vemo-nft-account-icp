import { getSSOUrl } from "src/utils/get-url"
import { useAuth } from "./http-service"
import axios from "axios"
import api from "src/api"


export enum AuthType {
  Basic,
  Bearer,
  ///...
}

export default class SSOApiAsync {
  private static classInstance?: SSOApiAsync
  private baseURL: string

  private constructor() {
    this.baseURL = import.meta.env.VITE_SSO_SERVICE_URL
  }

  public static getInstance() {
    if (!this.classInstance) {
      this.classInstance = new SSOApiAsync()
    }
    return this.classInstance
  }

  generateChallenge(wallet: string, chain_id: string, ...config: any) {
    return api.post(getSSOUrl(`generate-challenge`), {
      wallet,
      chain_id,
    })
  }

  @useAuth(AuthType.Bearer)
  getProfile(...args: any[]): any {
    const config = [...args].pop()
    return axios.get(getSSOUrl(`get_profile`), config)
  }
}
