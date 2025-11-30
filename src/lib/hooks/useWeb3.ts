"use client";

import { defaultChain } from "@/web3/config";
import { Provider, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAccount } from "wagmi";

const APPKIT_NAMESPACE = "eip155";

export default function useWeb3() {
  const account = useAccount();
  const {
    address: appKitAddress,
    isConnected,
    status: appKitStatus,
  } = useAppKitAccount({ namespace: APPKIT_NAMESPACE });
  const chain = account.chain;
  const _chain = chain ? chain : defaultChain;

  const { walletProvider } = useAppKitProvider<Provider>(APPKIT_NAMESPACE);

  // Prioritize AppKit address since that's what the wallet connection uses
  // AppKit is the source of truth for wallet connections
  // Use appKitAddress first, then fallback to account.address
  const resolvedAddress = appKitAddress ?? account.address ?? undefined;
  const resolvedStatus =
    appKitStatus === "connected"
      ? appKitStatus
      : account.status === "connected"
        ? account.status
        : (appKitStatus ?? account.status);

  // Debug logging - always log to help debug
  if (typeof window !== "undefined") {
    console.debug("🔍 [useWeb3] Address resolution:", {
      appKitAddress: appKitAddress || "undefined",
      wagmiAddress: account.address || "undefined",
      resolvedAddress: resolvedAddress || "undefined",
      appKitStatus,
      wagmiStatus: account.status,
      resolvedStatus,
      isConnected,
      hasAppKitAddress: !!appKitAddress,
      hasWagmiAddress: !!account.address,
      appKitAddressType: typeof appKitAddress,
      wagmiAddressType: typeof account.address,
    });
  }

  return {
    ...account,
    address: resolvedAddress,
    status: resolvedStatus,
    chain: _chain,
    chainId: _chain.id,
    wagmiChain: chain,
    provider: walletProvider,
    appKitStatus,
    appKitIsConnected: isConnected,
  };
}
