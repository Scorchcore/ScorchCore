/**
 * CoreMinerNFT ABI - Con mapping tokenId → metadata CID
 * Contrato desplegado en Ronin
 */

import CoreMinerNFTArtifact from './CoreMinerNFT.json';

export const coreMinerNFTABI = CoreMinerNFTArtifact.abi;

export const COREMINER_NFT_FUNCTIONS = {
  // Minteo
  mintMinerWithCID: 'mintMinerWithCID',
  
  // View functions
  tokenURI: 'tokenURI',
  getCategory: 'getCategory',
  getType: 'getType',
  getMinerIndex: 'getMinerIndex',
  getPower: 'getPower',
  getMinerData: 'getMinerData',
  getTokenCID: 'getTokenCID',
  totalSupply: 'totalSupply',
  balanceOf: 'balanceOf',
  ownerOf: 'ownerOf',
  
  // Admin
  setTokenCID: 'setTokenCID',
  grantRole: 'grantRole',
  revokeRole: 'revokeRole',
  
  // ERC721 standard
  approve: 'approve',
  setApprovalForAll: 'setApprovalForAll',
  transferFrom: 'transferFrom',
  safeTransferFrom: 'safeTransferFrom',
} as const;

export const COREMINER_NFT_EVENTS = {
  MinerMinted: 'MinerMinted',
  Transfer: 'Transfer',
  Approval: 'Approval',
  ApprovalForAll: 'ApprovalForAll',
} as const;

export type CoreMinerCategory = 0 | 1 | 2; // PETIT, ALTO, ANIMAL
export type MinerType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // BEAST, AQUA, BIRD, etc.

export interface MinerData {
  category: CoreMinerCategory;
  minerType: MinerType;
  minerIndex: number; // 0-6
  power: number;
}

export interface MinerMintedEvent {
  to: string;
  tokenId: bigint;
  category: number;
  minerType: number;
  minerIndex: number;
  power: number;
  cid: string;
}
