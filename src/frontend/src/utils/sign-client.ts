import SignClient from "@walletconnect/sign-client";
import {
  ISignClientEvents,
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types";
import { getEip155ChainId } from "./wallet.util";

function assertSignClient<T extends SignClient | null>(
  web3Wallet: T
): asserts web3Wallet {
  return invariant(web3Wallet, "WalletConnect not initialized");
}
export function invariant<T extends unknown>(
  condition: T,
  error: string
): asserts condition {
  if (condition) {
    return;
  }

  throw new Error(error);
}

class SignClientFactory {
  private signClient: SignClient | null = null;
  public async init() {
    if (this.signClient) return;
    this.signClient = await SignClient.init({
      projectId: "81a2b9fa4fe6006d1066a1f2be6772d6",
      // metadata: {
      //   name: "Vemo Smart Wallet",
      //   description: "Vemo Smart Wallet",
      //   url: "https://app-stg.vemo.network/wallet",
      //   icons: ["https://app-stg.vemo.network/wallet/favicon.ico"],
      //   // permissions: {
      //   //   accounts: ["eth_accounts"],
      //   // },
      // },
    });

    // this.signClient.proposal.de
    // this.signClient.session.map.clear()
    // this.deleteAllProposal();

    return this.signClient;
  }

  public async connect(uri: string) {
    assertSignClient(this.signClient);
    await this.deleteAllProposal();
    await this.deleteAllSession();
    return await this.signClient.core.pairing.pair({ uri });
  }

  public getSignClient(): SignClient {
    assertSignClient(this.signClient);
    return this.signClient;
  }
  public async chainChanged(topic: string, chainId: string) {
    const eipChainId = getEip155ChainId(chainId);
    return await this.signClient?.emit({
      topic,
      event: {
        name: "chainChanged",
        data: Number(chainId),
      },
      chainId: eipChainId,
    });
  }
  public async accountChanged(topic: string, address: string, chainId: string) {
    assertSignClient(this.signClient);
    const eipChainId = getEip155ChainId(chainId);
    let currentSection = this.signClient?.session.get(topic);
    if (
      currentSection &&
      currentSection.namespaces &&
      currentSection.namespaces.eip155
    ) {
      let newAccounts =
        currentSection.namespaces.eip155.chains?.map(
          (e: string) => `${e}:${address}`
        ) ?? [];

      currentSection.namespaces.eip155.accounts = newAccounts;
      const eip155: any = currentSection.optionalNamespaces.eip155 ?? currentSection.requiredNamespaces.eip155
      eip155.accounts = newAccounts;
    }

    await this.signClient?.emit({
      topic,
      event: {
        name: "accountsChanged",
        data: [address],
      },
      chainId: eipChainId,
    });
    await this.signClient?.session.set(topic, currentSection);
    await this.signClient.update({
      topic,
      namespaces: currentSection.namespaces,
    });
  }
  public async disconnect(topic: string) {
    try {
      assertSignClient(this.signClient);
      await this.signClient?.disconnect({
        topic: topic,
        reason: {
          code: 100,
          message: "Connection deleted ",
          data: "Connection deleted ",
        },
      });

      this.deleteAllSession(topic);
      this.deleteAllProposal();
      // this.signClient.proposal.map.clear();
      // this.signClient.session.map.clear();
    } catch (error) {
      return error;
    }
  }

  public async approve(
    proposalID: any,
    namespace: any
  ): Promise<{
    topic: string;
    acknowledged: () => Promise<SessionTypes.Struct>;
  }> {
    return await this.signClient?.approve({
      id: proposalID,
      namespaces: namespace,
    })!;
  }

  public async respond({ topic, response }: { topic: string; response: any }) {
    assertSignClient(this.signClient);

    await this.signClient.respond({
      topic,
      response,
    });
  }

  public on(eventName: SignClientTypes.Event, handler: any) {
    assertSignClient(this.signClient);
    this.signClient.on(eventName, handler);
  }

  public async extend(topic: string) {
    assertSignClient(this.signClient);
    await this.signClient?.extend({
      topic: topic,
    });
  }

  public once(eventName: SignClientTypes.Event, handler: any) {
    assertSignClient(this.signClient);
    this.signClient.once(eventName, handler);
  }

  public ping(topic: string) {
    assertSignClient(this.signClient);
    try {
      this.signClient.ping({ topic });
    } catch (error) {}
  }

  public async deleteAllSession(topic?: string) {
    assertSignClient(this.signClient);
    const sessionLength = this.signClient.session?.length;
    try {
      if (sessionLength) {
        for (let i = 0; i < sessionLength; i++) {
          const session = this.signClient.session.getAll()[i];
          await this.signClient.session.delete(session.topic, {
            code: 100,
            message: "Connection deleted ",
            data: "Connection deleted ",
          });
          if ((topic && session.topic !== topic) || !topic) {
            await this.signClient?.disconnect({
              topic: session.topic,
              reason: {
                code: 100,
                message: "Connection deleted ",
                data: "Connection deleted ",
              },
            });
          }
        }
      }
    } catch (error) {
      return false;
    }
  }

  private async deleteAllProposal() {
    assertSignClient(this.signClient);
    const sessionLength = this.signClient.proposal?.length;
    try {
      if (sessionLength) {
        for (let i = 0; i < sessionLength; i++) {
          const proposal = this.signClient.proposal.getAll()[i];
          await this.signClient.proposal.delete(proposal.id, {
            code: 1001,
            message: "Connection deleted ",
            data: "Connection deleted ",
          });
        }
      }
    } catch (error) {
      return false;
    }
  }
  public update(topic: string) {
    assertSignClient(this.signClient);
    try {
      // this.signClient.connect({ topic });
    } catch (error) {}
  }
}
export default SignClientFactory;
