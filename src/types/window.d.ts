/**
 * Type declarations for Window extensions
 * 
 * Provides type safety for browser APIs and wallet providers.
 */

interface EthereumProvider {
  request: (args: { 
    method: string; 
    params?: unknown[] 
  }) => Promise<unknown>;
  
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRonin?: boolean;
  
  // Chain methods
  chainId: string;
  networkVersion: string;
  selectedAddress: string | null;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
