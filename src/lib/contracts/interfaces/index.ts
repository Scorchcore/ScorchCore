/**
 * Barrel export de todas las interfaces de contratos
 * Implementan Liskov Substitution Principle (LSP)
 *
 * Uso:
 * import { IForgeContract, IMiningContract } from '@/lib/contracts/interfaces';
 */

// Export all contract interfaces
export * from "./IBlockchainContract";
export * from "./IForgeContract";
export * from "./IMiningContract";
export * from "./INFTContract";
export * from "./IERC20Contract";
export * from "./IMinerStatsManager";
export * from "./IEconomyContract";
export * from "./IGovernanceContract";
export * from "./ICycleContract";
export * from "./IAxieContract";
export * from "./ITrustScoreContract";
export * from "./IRoyaltyContract";

// Shared types
export type {
  HatchResult,
  MaterialRequirement,
  MaterialInput,
  ForgeChances,
  Recipe,
} from "./SharedTypes";

// Cycle System
export type {
  ICycleContract,
  MiningCycle,
  CycleEvents,
} from "./ICycleContract";
export { CycleDuration } from "./ICycleContract";

// fCORE System (Anti-Bot) - usar interfaces de ITokenContract
export type {
  IFCoreToken,
  IFCoreConverter,
  IMintableToken,
  IBurnableToken,
  ConversionInfo,
} from "./ITokenContract";

export type {
  IPohContract,
  VerificationData,
  PohOracleEvents,
} from "./IPohContract";
export { VerificationLevel } from "./IPohContract";

/**
 * Type guard helpers para verificar tipos de contratos
 */

import type { IBlockchainContract } from "./IBlockchainContract";
import type { IForgeContract } from "./IForgeContract";
import type { IMiningContract } from "./IMiningContract";
import type { INFTContract } from "./INFTContract";
import type { ITrustScoreContract } from "./ITrustScoreContract";

export type {
  IRecipeRegistry,
  RecipeInfo,
  RecipeCategory,
  MinerType,
  TransactionResult,
} from "./IRecipeRegistry";
export {
  CATEGORY_NAMES,
  MINER_TYPE_NAMES,
  MINER_TYPE_EMOJIS,
  CATEGORY_COLORS,
} from "./IRecipeRegistry";

// Collection/Set Bonuses
export type {
  ICollectionTracker,
  ISetRegistry,
  CollectionSet,
  SetProgress,
  UserBonusSummary,
} from "./ICollectionContract";
export { PREDEFINED_SETS } from "./ICollectionContract";

// GeodeHatcher
export type { IGeodeHatcher } from "./IGeodeHatcher";

// Staking Managers (Phase 3 - 26-Jan-2026)
export type { IGeodeStakingManager } from "./IGeodeStakingManager";
export type { ICoreMinerStakingManager } from "./ICoreMinerStakingManager";

// Economy & Gaming (Phase 3 - 26-Jan-2026)
export type {
  IScholarshipManager,
  ScholarshipOffer,
} from "./IScholarshipManager";
export type {
  IMinigameManager,
  MinigameResult,
  MinigameConfig,
} from "./IMinigameManager";
export type {
  IPvPArena,
  RaidInfo,
  DefenseStats,
  AttackStats,
} from "./IPvPArena";

/**
 * Verifica si un contrato implementa IForgeContract
 */
export function isForgeContract(
  contract: IBlockchainContract,
): contract is IForgeContract {
  return "forgeRecipe" in contract && "hatchGeode" in contract;
}

/**
 * Verifica si un contrato implementa IMiningContract
 */
export function isMiningContract(
  contract: IBlockchainContract,
): contract is IMiningContract {
  return "startMining" in contract && "claimRewards" in contract;
}

/**
 * Verifica si un contrato implementa INFTContract
 */
export function isNFTContract(
  contract: IBlockchainContract,
): contract is INFTContract {
  return "ownerOf" in contract && "tokenURI" in contract;
}

/**
 * Mapa de tipos de contratos
 */
export enum ContractType {
  FORGE = "forge",
  MINING = "mining",
  NFT = "nft",
  TOKEN = "token",
  ECONOMY = "economy",
  GOVERNANCE = "governance",
  UNKNOWN = "unknown",
}

/**
 * Obtiene el tipo de un contrato basado en sus métodos
 */
export function getContractType(contract: IBlockchainContract): ContractType {
  if (isForgeContract(contract)) return ContractType.FORGE;
  if (isMiningContract(contract)) return ContractType.MINING;
  if (isNFTContract(contract)) return ContractType.NFT;
  return ContractType.UNKNOWN;
}
