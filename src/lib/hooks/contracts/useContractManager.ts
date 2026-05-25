/**
 * Hook para acceder al ContractManager singleton
 *
 * Proporciona acceso centralizado a todos los contratos de forma reactiva.
 * Se actualiza cuando cambia la red o el signer del usuario.
 *
 * @category Core
 * @example
 * ```tsx
 * function MyComponent() {
 *   const contractManager = useContractManager();
 *
 *   useEffect(() => {
 *     const forgeContract = contractManager.getForgeFactory();
 *     // Usar contrato...
 *   }, [contractManager]);
 * }
 * ```
 */

import { useMemo, useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcProvider } from "ethers";
import type { JsonRpcSigner } from "ethers";
import { ContractManager } from "@/lib/contracts/ContractManager";
import type { ContractManagerConfig } from "@/lib/contracts/ContractManager";

/**
 * Hook que proporciona la instancia singleton de ContractManager
 * Se actualiza reactivamente cuando cambia la chain o wallet
 */
export function useContractManager(): {
  contractManager: ContractManager;
  signer: JsonRpcSigner | undefined;
} {
  const { chain, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  // Obtener signer de forma asíncrona
  useEffect(() => {
    let cancelled = false;

    async function getSigner() {
      if (walletClient && isConnected) {
        try {
          const browserProvider = new BrowserProvider(walletClient.transport);
          const resolvedSigner = await browserProvider.getSigner();

          if (!cancelled) {
            setSigner(resolvedSigner);
          }
        } catch (error) {
          console.error("❌ [useContractManager] Failed to get signer:", error);
          if (!cancelled) {
            setSigner(undefined);
          }
        }
      } else {
        if (!cancelled) {
          setSigner(undefined);
        }
      }
    }

    getSigner();

    return () => {
      cancelled = true;
    };
  }, [walletClient, isConnected]);

  // Actualizar ContractManager cuando el signer cambie
  useEffect(() => {
    if (signer) {
      const currentInstance = ContractManager.getInstance();
      currentInstance.updateConfig({ signer });
      // ✅ CRÍTICO: Limpiar caché para forzar recreación con signer
      currentInstance.clearCache();
    }
  }, [signer]);

  const contractManager = useMemo(() => {
    // Convertir viem clients a ethers provider
    let provider: JsonRpcProvider | undefined;
    let detectedChainId: number | undefined;

    if (publicClient) {
      // Detectar chainId desde RPC URL si no está disponible desde wagmi
      let chainIdToUse = chain?.id;
      let chainName = chain?.name;

      if (!chainIdToUse) {
        const rpcUrl = publicClient.transport.url || "";
        if (rpcUrl.includes("saigon")) {
          chainIdToUse = 202601;
          chainName = "Ronin Testnet";
        } else if (rpcUrl.includes("api.roninchain.com")) {
          chainIdToUse = 2020;
          chainName = "Ronin Mainnet";
        } else {
          chainIdToUse = 202601; // Fallback to testnet
          chainName = "Ronin Testnet";
        }
      }

      detectedChainId = chainIdToUse;

      // Crear provider de ethers desde public client de viem
      provider = new JsonRpcProvider(publicClient.transport.url, {
        chainId: chainIdToUse,
        name: chainName || "Ronin",
      });
    }

    // Usar el chainId detectado o el de la chain
    const finalChainId = detectedChainId || chain?.id || 202601;
    const config: ContractManagerConfig = {
      provider,
      signer,
      chainId: finalChainId,
    };

    return ContractManager.getInstance(config);
  }, [publicClient, chain?.id, chain?.name, signer]);

  return { contractManager, signer };
}
