/**
 * Objeto centralizado de ABIs para factories
 * Mapea nombres amigables a las ABIs exportadas
 */

import { PROOFOFHUMANITYORACLE_ABI } from './antibot.abis';
import { TRUSTSCOREMANAGER_ABI } from './antibot.abis';
import { FCORETOKEN_ABI } from './core.abis';
import { FCORECONVERTER_ABI } from './core.abis';
import { CORETOKEN_ABI } from './core.abis';
import { EMISSIONSCHEDULE_ABI } from './core.abis';
import { METADATAREGISTRY_ABI } from './core.abis';
import { MEMENTOVALIDATOR_ABI } from './core.abis';
import { MEMENTOTOKEN_ABI } from './core.abis';
import { VESTINGMANAGER_ABI } from './economy.abis';
import { PRICEORACLE_ABI } from './economy.abis';
import { BUYBACKFUND_ABI } from './economy.abis';
import { ROYALTYMANAGER_ABI } from './economy.abis';
import { FORGEFACTORY_ABI } from './forge.abis';
import { RECIPEREGISTRY_ABI } from './forge.abis';
import { SUPPLYTRACKER_ABI } from './forge.abis';
import { HATCHINGRANDOMNESS_ABI } from './forge.abis';
import { MATERIALVALIDATORTESTNET_ABI } from './forge.abis';
import { CHAINLINKVRFPROVIDER_ABI } from './forge.abis';
import { MINERSTATSMANAGER_ABI } from './mining.abis';
import { REWARDSCALCULATOR_ABI } from './mining.abis';
import { CYCLEMANAGER_ABI } from './mining.abis';
import { MININGPOOL_ABI } from './mining.abis';
import { AXIESTAKINGMANAGER_ABI } from './mining.abis';
import { BONUSCALCULATOR_ABI } from './mining.abis';
import { SETREGISTRY_ABI } from './mining.abis';
import { USERCOLLECTIONTRACKER_ABI } from './mining.abis';
import { COREMINERNFT_ABI } from './nft.abis';
import { GEODENFT_ABI } from './nft.abis';
import { IDNFT_ABI } from './nft.abis';
import { AXIE_NFT_ABI } from './axie.abis';
import { GEODE_HATCHER_ABI } from './GeodeHatcher';

/**
 * Mapeo centralizado de ABIs
 * Permite acceso por nombre amigable: CONTRACT_ABIS.ProofOfHumanityOracle
 */
export const CONTRACT_ABIS = {
  // Antibot
  ProofOfHumanityOracle: PROOFOFHUMANITYORACLE_ABI,
  TrustScoreManager: TRUSTSCOREMANAGER_ABI,
  
  // Core
  fCoreToken: FCORETOKEN_ABI,
  fCoreConverter: FCORECONVERTER_ABI,
  CoreToken: CORETOKEN_ABI,
  EmissionSchedule: EMISSIONSCHEDULE_ABI,
  MetadataRegistry: METADATAREGISTRY_ABI,
  MementoValidator: MEMENTOVALIDATOR_ABI,
  MementoToken: MEMENTOTOKEN_ABI,
  
  // Economy
  VestingManager: VESTINGMANAGER_ABI,
  PriceOracle: PRICEORACLE_ABI,
  BuybackFund: BUYBACKFUND_ABI,
  RoyaltyManager: ROYALTYMANAGER_ABI,
  
  // Forge
  ForgeFactory: FORGEFACTORY_ABI,
  RecipeRegistry: RECIPEREGISTRY_ABI,
  SupplyTracker: SUPPLYTRACKER_ABI,
  HatchingRandomness: HATCHINGRANDOMNESS_ABI,
  MaterialValidatorTestnet: MATERIALVALIDATORTESTNET_ABI,
  ChainlinkVRFProvider: CHAINLINKVRFPROVIDER_ABI,
  GeodeHatcher: GEODE_HATCHER_ABI,
  
  // Mining
  MinerStatsManager: MINERSTATSMANAGER_ABI,
  RewardsCalculator: REWARDSCALCULATOR_ABI,
  CycleManager: CYCLEMANAGER_ABI,
  MiningPool: MININGPOOL_ABI,
  AxieStakingManager: AXIESTAKINGMANAGER_ABI,
  BonusCalculator: BONUSCALCULATOR_ABI,
  SetRegistry: SETREGISTRY_ABI,
  UserCollectionTracker: USERCOLLECTIONTRACKER_ABI,
  
  // NFT
  CoreMinerNFT: COREMINERNFT_ABI,
  GeodeNFT: GEODENFT_ABI,
  IDNFT: IDNFT_ABI,
  AxieNFT: AXIE_NFT_ABI,
} as const;

export type ContractABIName = keyof typeof CONTRACT_ABIS;
