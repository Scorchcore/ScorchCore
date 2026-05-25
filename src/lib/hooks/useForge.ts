/**
 * Hook para gestionar la forja de Geodas
 */

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useContracts } from './useContracts';
import { createForgeService, GeodeType, type ForgeCosts, GEODE_COSTS } from '@/services/blockchain/forgeService';
import { ethers } from 'ethers';

export interface TokenBalances {
  axs: string;
  slp: string;
  memento: string;
}

export interface ApprovalStatus {
  axsApproved: boolean;
  slpApproved: boolean;
  mementoApproved: boolean;
}

export function useForge() {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const contracts = useContracts();

  const [balances, setBalances] = useState<TokenBalances>({
    axs: '0',
    slp: '0',
    memento: '0',
  });

  const [approvals, setApprovals] = useState<ApprovalStatus>({
    axsApproved: false,
    slpApproved: false,
    mementoApproved: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar balances
  const loadBalances = async () => {
    if (!address || !contracts || !chain) return;

    // Verificar que los contratos estén desplegados
    const isAXSValid = contracts.axsToken !== '0x0000000000000000000000000000000000000000';
    const isSLPValid = contracts.slpToken !== '0x0000000000000000000000000000000000000000';
    const isMementoValid = !!contracts.mementos && contracts.mementos.beast !== '0x0000000000000000000000000000000000000000';

    if (!isAXSValid || !isSLPValid || !isMementoValid) {
      console.warn('⚠️ Algunos contratos no están desplegados. Deploy los contratos en testnet primero.');
      // Mantener balances en 0
      return;
    }

    try {
      // Crear provider desde el RPC de la chain
      const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
      
      const forgeService = createForgeService(
        contracts.scorchHeartTransmuter,
        contracts.axsToken,
        contracts.slpToken,
        contracts.mementos.beast,
        provider as any
      );

      const tokenBalances = await forgeService.getTokenBalances(address);
      setBalances(tokenBalances);
    } catch (err) {
      console.error('Error loading balances:', err);
    }
  };

  // Verificar aprobaciones
  const checkApprovals = async (geodeType: GeodeType, mementosExtra: number = 0) => {
    if (!address || !contracts || !chain) return;

    // Verificar que los contratos estén desplegados
    const isAXSValid = contracts.axsToken !== '0x0000000000000000000000000000000000000000';
    const isSLPValid = contracts.slpToken !== '0x0000000000000000000000000000000000000000';
    const isMementoValid = contracts.mementoToken !== '0x0000000000000000000000000000000000000000';

    if (!isAXSValid || !isSLPValid || !isMementoValid) {
      // Mantener aprobaciones en false
      return null;
    }

    try {
      // Crear provider desde el RPC de la chain (solo lectura)
      const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);

      const forgeService = createForgeService(
        contracts.scorchHeartTransmuter,
        contracts.axsToken,
        contracts.slpToken,
        contracts.mementoToken,
        provider as any
      );

      const approvalStatus = await forgeService.checkApprovals(address, geodeType, mementosExtra);
      setApprovals(approvalStatus);
      return approvalStatus;
    } catch (err) {
      console.error('Error checking approvals:', err);
      return null;
    }
  };

  // Aprobar tokens
  const approveTokens = async (geodeType: GeodeType, mementosExtra: number = 0) => {
    if (!address || !contracts || !chain || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      const forgeService = createForgeService(
        contracts.scorchHeartTransmuter,
        contracts.axsToken,
        contracts.slpToken,
        contracts.mementos.beast,
        signer
      );

      await forgeService.approveAllTokens(geodeType, mementosExtra);
      await checkApprovals(geodeType, mementosExtra);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve tokens';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Forjar geoda
  const forgeGeode = async (geodeType: GeodeType, mementosToUse: number = 0) => {
    if (!address || !contracts || !chain || !walletClient) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      const forgeService = createForgeService(
        contracts.scorchHeartTransmuter,
        contracts.axsToken,
        contracts.slpToken,
        contracts.mementoToken,
        signer
      );

      const result = await forgeService.forgeGeode(geodeType, mementosToUse);
      
      // Recargar balances
      await loadBalances();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to forge geode';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Eclosionar geoda
  const hatchGeode = async (geodeId: bigint) => {
    console.log('🔧 [FORGE_HOOK] hatchGeode iniciado');
    console.log('🔧 [FORGE_HOOK] GeodeId:', geodeId.toString());
    console.log('🔧 [FORGE_HOOK] Estado inicial:', {
      address,
      hasContracts: !!contracts,
      hasChain: !!chain,
      hasWalletClient: !!walletClient
    });

    if (!address || !contracts || !chain || !walletClient) {
      console.error('❌ [FORGE_HOOK] Wallet not connected');
      throw new Error('Wallet not connected');
    }

    console.log('🔧 [FORGE_HOOK] Configurando loading state...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 [FORGE_HOOK] Creando provider y signer...');
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      console.log('🔧 [FORGE_HOOK] Signer creado:', await signer.getAddress());

      console.log('🔧 [FORGE_HOOK] Creando forgeService...');
      console.log('🔧 [FORGE_HOOK] Contratos:', {
        transmuter: contracts.scorchHeartTransmuter,
        axsToken: contracts.axsToken,
        slpToken: contracts.slpToken,
        mementos: contracts.mementos
      });

      const forgeService = createForgeService(
        contracts.scorchHeartTransmuter,
        contracts.axsToken,
        contracts.slpToken,
        contracts.mementos.beast, // Usar cualquier memento para hatchGeode (no se usa)
        signer
      );

      // Verificar que el usuario realmente posee ese tokenId, para evitar errores de "no existe"
      try {
        const owned = await forgeService.listUserGeodeTokenIds(await signer.getAddress());
        console.log('🔧 [FORGE_HOOK] Geodas del usuario (NFT):', owned.map(id => id.toString()));
        const ownsToken = owned.some(id => id === geodeId);
        console.log('🔧 [FORGE_HOOK] ¿Usuario posee geodeId?', ownsToken);
        if (!ownsToken) {
          throw new Error(`Tu wallet no posee la geoda ${geodeId.toString()}.`);
        }
      } catch (e) {
        console.log('🔧 [FORGE_HOOK] No se pudo confirmar propiedad vía NFT. Continuando con el intento de eclosión...', e);
      }

      console.log('🔧 [FORGE_HOOK] Ejecutando hatchGeode en forgeService...');
      const result = await forgeService.hatchGeode(geodeId);
      console.log('✅ [FORGE_HOOK] Resultado exitoso:', result);
      return result;
    } catch (err) {
      console.error('❌ [FORGE_HOOK] Error en hatchGeode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to hatch geode';
      console.error('❌ [FORGE_HOOK] Error message:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log('🔧 [FORGE_HOOK] Finalizando, setIsLoading(false)');
      setIsLoading(false);
    }
  };

  // Auto-cargar balances al conectar
  useEffect(() => {
    if (isConnected && address && contracts && chain) {
      loadBalances();
    }
  }, [isConnected, address, contracts, chain]);

  return {
    // Data
    balances,
    approvals,
    costs: GEODE_COSTS,

    // States
    isLoading,
    error,
    isConnected,

    // Actions
    loadBalances,
    checkApprovals,
    approveTokens,
    forgeGeode,
    hatchGeode,
  };
}
