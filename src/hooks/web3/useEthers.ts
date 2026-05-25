/**
 * Hooks de ethers.js usando wagmi/viem
 */

import { useMemo } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, type Provider } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';
import type { Config } from 'wagmi';

/**
 * Convierte un walletClient de viem a ethers Signer
 */
export function walletClientToSigner(walletClient: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/**
 * Hook para obtener signer de ethers.js desde wagmi
 */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}

/**
 * Convierte publicClient de viem a ethers Provider
 */
export function publicClientToProvider(publicClient: Client<Transport, Chain>) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new BrowserProvider(transport, network);
}

/**
 * Hook para obtener provider de ethers.js desde wagmi
 */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  return useMemo(
    () => (publicClient ? publicClientToProvider(publicClient) : undefined),
    [publicClient]
  );
}
