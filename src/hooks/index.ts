/**
 * Barrel export para hooks de NFTs
 * Todos los hooks tienen soporte para supply dinámico con eventos y cache
 */

// ========== HOOKS DE CoreMinerNFT ==========
export {
  useCoreMinerNFT,
  useUserMiners,
  useMinerData,
  useMinerMetadata,
  useMinerTotalSupply,
  useMinerMintedEvents,
  useTransferEvents,
  useCompleteMinerInfo,
  type UseMinerOptions,
} from './contracts/useCoreMinerNFTDynamic';

// ========== HOOKS DE GeodeNFT ==========
export {
  useGeodeNFT,
  useUserGeodes,
  useGeodeData,
  useGeodeMetadata,
  useGeodeTotalSupply,
  useGeodeMintedEvents,
  useGeodeBurnedEvents,
  useCompleteGeodeInfo,
  type UseGeodeOptions,
} from './contracts/useGeodeNFTDynamic';

// ========== HOOKS DE IPFS ==========
export * from './web3/useIPFS';

// ========== HOOKS DE ETHERS ==========
export * from './web3/useEthers';
