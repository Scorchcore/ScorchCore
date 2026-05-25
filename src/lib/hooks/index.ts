/**
 * Barrel export de todos los hooks
 * 
 * Organizado por categoría de funcionalidad:
 * - Core: Infraestructura base
 * - NFT: Gestión de NFTs (Miners, Axies)
 * - Forge: Forja y eclosión de geodas
 * - Mining: Operaciones de minería
 * - Balance: Consulta de balances
 */

// ==========================================
// CORE - Infraestructura base
// ==========================================
// Export all hooks from this barrel
export * from './user/useWallet';
export * from './contracts/useContractManager';
export * from './mining/useMining';
export * from './nfts/useNFTs';
export * from './facades/useForgeFacade';
export * from './facades/useNFTFacade';
export * from './mining/useMiningStats';
export * from './services/useTokenService';
export * from './economy/useMementoBalances';
export * from './facades/useInventoryFacade';

// Export new hooks
export * from './contracts/useContracts';
export * from './user/useUserData';
export * from './services/useMetadataService';

// ==========================================
// NFT - Gestión de NFTs
// ==========================================
export { useNFTFacade } from './facades/useNFTFacade';
export { useNFTs } from './nfts/useNFTs';
export type { 
  UseNFTsOptions, 
  UseNFTsReturn 
} from './nfts/useNFTs';

// ==========================================
// FORGE - Forja y eclosión
// ==========================================
export { useForgeFacade } from './facades/useForgeFacade';
export { useInventoryFacade } from './facades/useInventoryFacade';
export { useGeodeStaking } from './nfts/useGeodeStaking';

// ==========================================
// MINING - Operaciones de minería
// ==========================================
// Mining hooks
export { useMining } from './mining/useMining';
export { useCycleManager, useCycleBonusInfo, useUserCyclesSummary } from './economy/useCycleManager';
export { useMinerActions } from './mining/useMinerActions';
export type { UseMiningReturn } from './mining/useMining';
export type { UseCycleManagerReturn } from './economy/useCycleManager';
export type { UseMinerActionsReturn, MinerActionResult } from './mining/useMinerActions';

// fCore System Hook (Anti-Bot)
export {
  usefCoreBalance,
  type UsefCoreBalanceReturn
} from './economy/usefCoreBalance';

export type {
  MiningStatsData,
  UseMiningStatsOptions,
  UseMiningStatsReturn
} from './mining/useMiningStats';

// ==========================================
// BALANCE - Consulta de balances
// ==========================================
export { useMementoBalances } from './economy/useMementoBalances';
export type {
  MementoBalance,
  MementoBalances,
  UseMementoBalancesOptions,
  UseMementoBalancesReturn
} from './economy/useMementoBalances';
