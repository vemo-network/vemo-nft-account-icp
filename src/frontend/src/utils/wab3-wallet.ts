import Core from "@walletconnect/core";
import { ProposalTypes, SessionTypes } from "@walletconnect/types";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import type Web3WalletType from "@walletconnect/web3wallet";
import Web3Wallet from "@walletconnect/web3wallet";
import type { Web3WalletTypes } from "@walletconnect/web3wallet";
import { uniq } from "lodash";
import { getEip155ChainId } from "./wallet.util";
import {
  assertWeb3Wallet,
  EIP155,
  SAFE_COMPATIBLE_EVENTS,
  SAFE_COMPATIBLE_METHODS,
  stripEip155Prefix,
} from "./WalletConnect";

const SESSION_ADD_EVENT = "session_add" as Web3WalletTypes.Event; // Workaround: WalletConnect doesn't emit session_add event

class WalletConnectWallet {
  private web3Wallet: Web3WalletType | null = null;

  /**
   * Initialize WalletConnect wallet SDK
   */
  public async init() {
    if (this.web3Wallet) return;

    const core = new Core({
      projectId: "06c38aefb19c52e7730cc9d100ccb722",
    });

    const web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "Demo app",
        description: "Demo Client as Wallet/Peer",
        url: "www.walletconnect.com",
        icons: [],
      },
      // metadata: SAFE_WALLET_METADATA,
    });

    this.web3Wallet = web3wallet;
  }

  /**
   * Connect using a wc-URI
   */
  public async connect(uri: string) {
    assertWeb3Wallet(this.web3Wallet);
    return this.web3Wallet.core.pairing.pair({ uri });
  }

  public async chainChanged(topic: string, chainId: string) {
    const eipChainId = getEip155ChainId(chainId);

    return this.web3Wallet?.emitSessionEvent({
      topic,
      event: {
        name: "chainChanged",
        data: Number(chainId),
      },
      chainId: eipChainId,
    });
  }

  public async accountsChanged(
    topic: string,
    chainId: string,
    address: string
  ) {
    const eipChainId = getEip155ChainId(chainId);

    return this.web3Wallet?.emitSessionEvent({
      topic,
      event: {
        name: "accountsChanged",
        data: [address],
      },
      chainId: eipChainId,
    });
  }
  private getNamespaces(
    proposal: Web3WalletTypes.SessionProposal,
    currentChainId: string,
    safeAddress: string
  ) {
    // As workaround, we pretend to support all the required chains plus the current Safe's chain
    const requiredChains =
      proposal.params.requiredNamespaces[EIP155]?.chains || [];

    const supportedChainIds = [currentChainId].concat(
      requiredChains.map(stripEip155Prefix)
    );

    const eip155ChainIds = supportedChainIds.map(getEip155ChainId);
    const eip155Accounts = eip155ChainIds.map(
      (eip155ChainId) => `${eip155ChainId}:${safeAddress}`
    );

    // Don't include optionalNamespaces methods/events
    const methods = uniq(
      (proposal.params.requiredNamespaces[EIP155]?.methods || []).concat(
        SAFE_COMPATIBLE_METHODS
      )
    );
    const events = uniq(
      (proposal.params.requiredNamespaces[EIP155]?.events || []).concat(
        SAFE_COMPATIBLE_EVENTS
      )
    );

    return buildApprovedNamespaces({
      proposal: proposal.params,
      supportedNamespaces: {
        [EIP155]: {
          chains: eip155ChainIds,
          accounts: eip155Accounts,
          methods,
          events,
        },
      },
    });
  }
  public async approveSession(
    proposal: Web3WalletTypes.SessionProposal,
    currentChainId: string,
    safeAddress: string,
    sessionProperties?: ProposalTypes.SessionProperties
  ) {
    assertWeb3Wallet(this.web3Wallet);

    const namespaces = this.getNamespaces(
      proposal,
      currentChainId,
      safeAddress
    );

    // Approve the session proposal
    const session = await this.web3Wallet.approveSession({
      id: proposal.id,
      namespaces,
      sessionProperties,
    });

    await this.chainChanged(session.topic, currentChainId);

    // Workaround: WalletConnect doesn't have a session_add event
    // and we want to update our state inside the useWalletConnectSessions hook
    this.web3Wallet?.events.emit(SESSION_ADD_EVENT, session);

    // Return updated session as it may have changed
    return (
      this.getActiveSessions().find(({ topic }) => topic === session.topic) ??
      session
    );
  }
  public getActiveSessions(): SessionTypes.Struct[] {
    const sessionsMap = this.web3Wallet?.getActiveSessions() || {};
    return Object.values(sessionsMap);
  }
  private async updateSession(session: SessionTypes.Struct, chainId: string, safeAddress: string) {
    assertWeb3Wallet(this.web3Wallet)

    const currentEip155ChainIds = session.namespaces[EIP155]?.chains || []
    const currentEip155Accounts = session.namespaces[EIP155]?.accounts || []

    const newEip155ChainId = getEip155ChainId(chainId)
    const newEip155Account = `${newEip155ChainId}:${safeAddress}`

    const isUnsupportedChain = !currentEip155ChainIds.includes(newEip155ChainId)
    const isNewSessionSafe = !currentEip155Accounts.includes(newEip155Account)

    // Switching to unsupported chain
    if (isUnsupportedChain) {
      return this.disconnectSession(session)
    }

    // Add new Safe to the session namespace
    if (isNewSessionSafe) {
      const namespaces: SessionTypes.Namespaces = {
        [EIP155]: {
          ...session.namespaces[EIP155],
          chains: currentEip155ChainIds,
          accounts: [newEip155Account, ...currentEip155Accounts],
        },
      }

      await this.web3Wallet.updateSession({
        topic: session.topic,
        namespaces,
      })
    }

    // Switch to the new chain
    await this.chainChanged(session.topic, chainId)

    // Switch to the new Safe
    await this.accountsChanged(session.topic, chainId, safeAddress)
  }
  public async disconnectSession(session: SessionTypes.Struct) {
    assertWeb3Wallet(this.web3Wallet)

    await this.web3Wallet.disconnectSession({
      topic: session.topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })

    // Workaround: WalletConnect doesn't emit session_delete event when disconnecting from the wallet side
    // and we want to update the state inside the useWalletConnectSessions hook
    this.web3Wallet.events.emit('session_delete', session)
  }
  public async updateSessions(chainId: string, safeAddress: string) {
    // If updating sessions disconnects multiple due to an unsupported chain,
    // we need to wait for the previous session to disconnect before the next
    for await (const session of this.getActiveSessions()) {
      await this.updateSession(session, chainId, safeAddress)
    }
  }
  public onRequest(handler: (event: Web3WalletTypes.SessionRequest) => void) {
    this.web3Wallet?.on('session_request', handler)

    return () => {
      this.web3Wallet?.off('session_request', handler)
    }
  }
  public onSessionPropose(handler: (e: Web3WalletTypes.SessionProposal) => void) {
    // Subscribe to the session proposal event
    this.web3Wallet?.on('session_proposal', handler)

    // Return the unsubscribe function
    return () => {
      this.web3Wallet?.off('session_proposal', handler)
    }
  }

}

export default WalletConnectWallet;
