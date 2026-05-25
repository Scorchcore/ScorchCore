/**
 * AxieContractFactory - Factory para crear instancias del contrato Axie NFT
 * Implementa el patrón Factory (GoF) para encapsular la creación de contratos
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { AXIE_NFT_ABI } from '@/lib/abis/axie.abis';
import type { IAxieContract } from '../interfaces/IAxieContract';

export interface AxieContractConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato Axie NFT
 */
export class AxieContractFactory {
  /**
   * Crea una instancia del contrato Axie NFT
   */
  createAxieContract(config: AxieContractConfig): IAxieContract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      AXIE_NFT_ABI,
      signerOrProvider
    );

    return {
      balanceOf: async (owner: Address) => {
        const balance = await contract.balanceOf(owner);
        return BigInt(balance.toString());
      },

      tokenOfOwnerByIndex: async (owner: Address, index: bigint) => {
        const tokenId = await contract.tokenOfOwnerByIndex(owner, index);
        return BigInt(tokenId.toString());
      },

      ownerOf: async (tokenId: bigint) => {
        return await contract.ownerOf(tokenId) as Address;
      },

      tokenURI: async (tokenId: bigint) => {
        return await contract.tokenURI(tokenId);
      },

      getAxie: async (tokenId: bigint) => {
        const result = await contract.getAxie(tokenId);
        return {
          genes: BigInt(result.genes.toString()),
          birthDate: BigInt(result.bornAt.toString()),
          matronId: 0n,
          sireId: 0n,
        };
      },

      tokensOfOwner: async (owner: Address) => {
        const balance = await contract.balanceOf(owner);
        const tokens: bigint[] = [];
        
        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
          tokens.push(BigInt(tokenId.toString()));
        }
        
        return tokens;
      },

      approve: async (to: Address, tokenId: bigint) => {
        const tx = await contract.approve(to, tokenId);
        await tx.wait();
      },

      setApprovalForAll: async (operator: Address, approved: boolean) => {
        const tx = await contract.setApprovalForAll(operator, approved);
        await tx.wait();
      },

      isApprovedForAll: async (owner: Address, operator: Address) => {
        return await contract.isApprovedForAll(owner, operator);
      },

      getApproved: async (tokenId: bigint) => {
        return await contract.getApproved(tokenId) as Address;
      },
    };
  }
}
