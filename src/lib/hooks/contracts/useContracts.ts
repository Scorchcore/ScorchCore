/**
 * Hook para acceso a direcciones de contratos
 *
 * Proporciona acceso tipado a todas las direcciones de contratos desplegados.
 * Útil para componentes que necesitan interactuar directamente con addresses.
 *
 * @category Core
 * @example
 * ```tsx
 * function Component() {
 *   const contracts = useContracts();
 *
 *   return <div>CoreMiner: {contracts.coreMinerNFT}</div>;
 * }
 * ```
 */

import { CONTRACT_ADDRESSES } from "@/lib/config/deployment.config";
import { TESTNET_CONTRACTS } from "@/lib/config/contracts";
import type { Address } from "viem";

/**
 * Tipo de retorno del hook useContracts
 */
export interface UseContractsReturn {
  /** Dirección del contrato CoreMinerNFT */
  coreMinerNFT: Address;

  /** Dirección del contrato GeodeNFT */
  geodeNFT: Address;

  /** Dirección del contrato MiningPool */
  miningContract: Address;

  /** Dirección del contrato ForgeFactory (GeodeNFT) */
  forgeContract: Address;

  /** Dirección del token CORE */
  coreToken: Address;

  /** Dirección del contrato ScorchHeartTransmuter (Forge) */
  scorchHeartTransmuter: Address;

  /** Dirección del token Memento */
  mementoToken: Address;

  /** Mementos por clase de Axie (ERC-1155 Multi-Type) */
  mementos: {
    beast: Address;
    aqua: Address;
    bird: Address;
    reptile: Address;
    bug: Address;
    plant: Address;
    mech: Address;
    dusk: Address;
    dawn: Address;
  };

  /** Dirección del MinerStatsManager */
  minerStatsManager: Address;

  /** Token AXS */
  axsToken: Address;

  /** Token SLP */
  slpToken: Address;

  /** Alias para miningContract (compatibilidad legacy) */
  miningScheduler: Address;

  /** Todas las direcciones de contratos */
  all: typeof CONTRACT_ADDRESSES;
}

/**
 * Hook que proporciona acceso a direcciones de contratos
 *
 * @returns Objeto con direcciones de contratos tipadas
 */
export function useContracts(): UseContractsReturn {
  const mementoAddress = CONTRACT_ADDRESSES.MementoToken as Address;
  const miningPoolAddress = CONTRACT_ADDRESSES.MiningPool as Address;

  return {
    coreMinerNFT: CONTRACT_ADDRESSES.CoreMinerNFT as Address,
    geodeNFT: CONTRACT_ADDRESSES.GeodeNFT as Address,
    miningContract: miningPoolAddress,
    forgeContract: CONTRACT_ADDRESSES.GeodeNFT as Address, // GeodeNFT actúa como forge
    coreToken: CONTRACT_ADDRESSES.CoreToken as Address,
    scorchHeartTransmuter: TESTNET_CONTRACTS.scorchHeartTransmuter,
    mementoToken: mementoAddress,
    mementos: TESTNET_CONTRACTS.mementos, // Usar config de testnet con mementos por clase
    minerStatsManager: CONTRACT_ADDRESSES.MinerStatsManager as Address,
    axsToken: CONTRACT_ADDRESSES.axsToken as Address,
    slpToken: CONTRACT_ADDRESSES.slpToken as Address,
    miningScheduler: miningPoolAddress, // Alias para compatibilidad
    all: CONTRACT_ADDRESSES,
  };
}
