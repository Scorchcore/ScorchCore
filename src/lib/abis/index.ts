/**
 * Central exports for all contract ABIs
 * Auto-generated - Do not edit manually
 */

export { RewardsCalculatorABI } from "./RewardsCalculator";
export { MiningPoolABI } from "./MiningPool";
export { GeodeStakingManagerABI } from "./GeodeStakingManager";
export { CoreMinerStakingManagerABI } from "./CoreMinerStakingManager";
export { ScholarshipManagerABI } from "./ScholarshipManager";
export { MinigameManagerABI } from "./MinigameManager";
export { PvPArenaABI } from "./PvPArena";

// Re-export existing ABIs
export * from "./core.abis";
export * from "./mining.abis";
export * from "./nft.abis";
export * from "./forge.abis";
export * from "./economy.abis";
export * from "./antibot.abis";
export * from "./axie.abis";

// Alias para compatibilidad legacy
export { FORGEFACTORY_ABI as TRANSMUTER_ABI } from "./forge.abis";
export { geodeNFTABI as GEODE_NFT_ABI } from "./geodeNFT";
export { MiningPoolABI as MINING_SCHEDULER_ABI } from "./MiningPool";
export { FCORETOKEN_ABI as FCORE_TOKEN_ABI } from "./core.abis";
export { AXIE_NFT_ABI as AXIE_ABI } from "./axie.abis";
export { coreMinerNFTABI as CORE_MINER_ABI } from "./coreMinerNFT";

// Minimal standard ERC20 ABI
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

// Export CONTRACT_ABIS object for factories
export { CONTRACT_ABIS, type ContractABIName } from "./CONTRACT_ABIS";
