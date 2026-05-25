/**
 * Servicio para interactuar con CoreMinerNFT
 */

import { ethers } from 'ethers';
import { coreMinerNFTABI } from '@/lib/abis/coreMinerNFT';
import { getContractAddress, RONIN_TESTNET_CHAIN_ID } from '@/lib/contracts/addresses';
import type { MinerData } from '@/lib/abis/coreMinerNFT';

export class CoreMinerNFTService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    const address = getContractAddress(RONIN_TESTNET_CHAIN_ID, 'coreMinerNFT');
    this.contract = new ethers.Contract(
      address,
      coreMinerNFTABI,
      signer || provider
    );
  }

  // ========== READ FUNCTIONS ==========

  /**
   * Obtiene la URI de metadata de un token
   */
  async getTokenURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }

  /**
   * Obtiene los datos completos de un miner
   */
  async getMinerData(tokenId: number): Promise<MinerData> {
    const [category, minerType, minerIndex, power] = await this.contract.getMinerData(tokenId);
    return {
      category,
      minerType,
      minerIndex: Number(minerIndex),
      power: Number(power),
    };
  }

  /**
   * Obtiene el CID de metadata de un token
   */
  async getTokenCID(tokenId: number): Promise<string> {
    return await this.contract.getTokenCID(tokenId);
  }

  /**
   * Obtiene el balance de NFTs de una dirección
   */
  async balanceOf(address: string): Promise<number> {
    const balance = await this.contract.balanceOf(address);
    return Number(balance);
  }

  /**
   * Obtiene el propietario de un token
   */
  async ownerOf(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }

  /**
   * Obtiene el total supply de miners
   */
  async totalSupply(): Promise<number> {
    const supply = await this.contract.totalSupply();
    return Number(supply);
  }

  /**
   * Obtiene todos los tokenIds de una dirección
   */
  async getTokensOfOwner(owner: string): Promise<number[]> {
    const balance = await this.balanceOf(owner);
    const tokens: number[] = [];
    
    // No hay función tokenOfOwnerByIndex, tenemos que buscar manualmente
    // o implementar un mejor método en el contrato
    const totalSupply = await this.totalSupply();
    
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const tokenOwner = await this.ownerOf(i);
        if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
          tokens.push(i);
          if (tokens.length >= balance) break; // Optimización
        }
      } catch {
        // Token no existe o fue quemado
        continue;
      }
    }
    
    return tokens;
  }

  /**
   * Obtiene la metadata completa de IPFS con fallback automático
   */
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

  // ========== WRITE FUNCTIONS (requieren signer) ==========

  /**
   * Aprueba un spender para un token específico
   */
  async approve(spender: string, tokenId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.approve(spender, tokenId);
  }

  /**
   * Aprueba un operador para todos los tokens
   */
  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.setApprovalForAll(operator, approved);
  }

  /**
   * Transfiere un token
   */
  async transferFrom(
    from: string,
    to: string,
    tokenId: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract.transferFrom(from, to, tokenId);
  }

  /**
   * Safe transfer de un token
   */
  async safeTransferFrom(
    from: string,
    to: string,
    tokenId: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return await this.contract['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
  }

  // ========== ADMIN FUNCTIONS ==========

  /**
   * Mintea un nuevo miner (solo MINTER_ROLE)
   */
  async mintMinerWithCID(
    to: string,
    category: number,
    minerType: number,
    minerIndex: number,
    power: number,
    metadataCID: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for minting');
    return await this.contract.mintMinerWithCID(
      to,
      category,
      minerType,
      minerIndex,
      power,
      metadataCID
    );
  }

  /**
   * Actualiza el CID de un token (solo ADMIN_ROLE)
   */
  async setTokenCID(
    tokenId: number,
    newCID: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) throw new Error('Signer required for admin operations');
    return await this.contract.setTokenCID(tokenId, newCID);
  }

  // ========== HELPERS ==========

  /**
   * Verifica si una dirección está aprobada para un token
   */
  async getApproved(tokenId: number): Promise<string> {
    return await this.contract.getApproved(tokenId);
  }

  /**
   * Verifica si un operador está aprobado para todos los tokens
   */
  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return await this.contract.isApprovedForAll(owner, operator);
  }

  /**
   * Escucha eventos del contrato
   */
  onMinerMinted(callback: (event: any) => void): void {
    this.contract.on('MinerMinted', callback);
  }

  /**
   * Escucha transferencias
   */
  onTransfer(callback: (from: string, to: string, tokenId: bigint) => void): void {
    this.contract.on('Transfer', callback);
  }

  /**
   * Detiene escucha de eventos
   */
  removeAllListeners(): void {
    this.contract.removeAllListeners();
  }
}
