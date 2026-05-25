/**
 * Servicio para interactuar con GeodeNFT
 */

import { ethers } from 'ethers';
import { geodeNFTABI } from '@/lib/abis/geodeNFT';
import { getContractAddress, RONIN_TESTNET_CHAIN_ID } from '@/lib/contracts/addresses';
import type { GeodeData } from '@/lib/abis/geodeNFT';

export class GeodeNFTService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    const address = getContractAddress(RONIN_TESTNET_CHAIN_ID, 'geodeNFT');
    this.contract = new ethers.Contract(
      address,
      geodeNFTABI,
      signer || provider
    );
  }

  // ========== READ FUNCTIONS ==========

  async getTokenURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }

  async getGeodeData(tokenId: number): Promise<GeodeData> {
    const [category, geodeType] = await this.contract.getGeodeData(tokenId);
    return { category, geodeType };
  }

  async balanceOf(address: string): Promise<number> {
    const balance = await this.contract.balanceOf(address);
    return Number(balance);
  }

  async ownerOf(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }

  async totalSupply(): Promise<number> {
    const supply = await this.contract.totalSupply();
    return Number(supply);
  }

  async getTokensOfOwner(owner: string): Promise<number[]> {
    const balance = await this.balanceOf(owner);
    const tokens: number[] = [];
    const totalSupply = await this.totalSupply();
    
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const tokenOwner = await this.ownerOf(i);
        if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
          tokens.push(i);
          if (tokens.length >= balance) break;
        }
      } catch {
        continue;
      }
    }
    
    return tokens;
  }

  async getMetadata(tokenId: number): Promise<any> {
    const uri = await this.getTokenURI(tokenId);
    
    try {
      const { fetchJSONFromIPFS } = await import('@/lib/utils/ipfs/ipfs');
      return await fetchJSONFromIPFS(uri, { timeout: 15000, retries: 1 });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  // ========== WRITE FUNCTIONS ==========

  async approve(spender: string, tokenId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.approve(spender, tokenId);
  }

  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.setApprovalForAll(operator, approved);
  }

  async transferFrom(
    from: string,
    to: string,
    tokenId: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.transferFrom(from, to, tokenId);
  }

  async burn(tokenId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for burn');
    return await this.contract.burn(tokenId);
  }

  // ========== HELPERS ==========

  async getApproved(tokenId: number): Promise<string> {
    return await this.contract.getApproved(tokenId);
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return await this.contract.isApprovedForAll(owner, operator);
  }

  onGeodeMinted(callback: (event: any) => void): void {
    this.contract.on('GeodeMinted', callback);
  }

  onGeodeBurned(callback: (tokenId: bigint) => void): void {
    this.contract.on('GeodeBurned', callback);
  }

  onTransfer(callback: (from: string, to: string, tokenId: bigint) => void): void {
    this.contract.on('Transfer', callback);
  }

  removeAllListeners(): void {
    this.contract.removeAllListeners();
  }
}
