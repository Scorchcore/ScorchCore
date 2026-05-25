/**
 * GeodeNFT ABI
 * Contrato desplegado en Ronin
 */

import GeodeNFTArtifact from './GeodeNFT.json';

export const geodeNFTABI = GeodeNFTArtifact.abi;

export const GEODE_NFT_FUNCTIONS = {
  // Minteo
  mint: 'mint',
  
  // View functions
  tokenURI: 'tokenURI',
  getCategory: 'getCategory',
  getType: 'getType',
  getGeodeData: 'getGeodeData',
  totalSupply: 'totalSupply',
  balanceOf: 'balanceOf',
  ownerOf: 'ownerOf',
  
  // Burn
  burn: 'burn',
  
  // Admin
  setMetadataProvider: 'setMetadataProvider',
  grantRole: 'grantRole',
  revokeRole: 'revokeRole',
  
  // ERC721 standard
  approve: 'approve',
  setApprovalForAll: 'setApprovalForAll',
  transferFrom: 'transferFrom',
  safeTransferFrom: 'safeTransferFrom',
} as const;

export const GEODE_NFT_EVENTS = {
  GeodeMinted: 'GeodeMinted',
  GeodeBurned: 'GeodeBurned',
  Transfer: 'Transfer',
  Approval: 'Approval',
  ApprovalForAll: 'ApprovalForAll',
} as const;

export type GeodeCategory = 0 | 1 | 2; // PETIT, ALTO, ANIMAL
export type GeodeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // BEAST, AQUA, BIRD, etc.

export interface GeodeData {
  category: GeodeCategory;
  geodeType: GeodeType;
}

export interface GeodeMintedEvent {
  to: string;
  tokenId: bigint;
  category: number;
  geodeType: number;
}
