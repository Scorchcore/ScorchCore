/**
 * MaterialValidator Contract Factory
 * Implements IMaterialValidatorContract interface
 * @module MaterialValidatorContractFactory
 */

import { Address, PublicClient } from 'viem';
import { MATERIALVALIDATORTESTNET_ABI } from '@/lib/abis/forge.abis';
import { IMaterialValidatorContract, MaterialCosts } from '../interfaces/IMaterialValidatorContract';

/**
 * Factory for MaterialValidator contract interactions
 */
export class MaterialValidatorContractFactory implements IMaterialValidatorContract {
  constructor(
    private publicClient: PublicClient,
    private contractAddress: Address
  ) {}

  /**
   * Get forging costs for a specific category
   */
  async getCosts(category: number): Promise<MaterialCosts> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MATERIALVALIDATORTESTNET_ABI,
        functionName: 'getCosts',
        args: [category],
      });

      return {
        axsAmount: result[0],
        slpAmount: result[1],
      };
    } catch (error) {
      throw new Error(`Failed to get costs for category ${category}: ${error}`);
    }
  }

  /**
   * Check if user has approved sufficient tokens
   */
  async checkApprovals(userAddress: Address, category: number): Promise<{
    axsApproved: boolean;
    slpApproved: boolean;
    axsAllowance: bigint;
    slpAllowance: bigint;
  }> {
    try {
      // Get required costs
      const costs = await this.getCosts(category);
      
      // Get token addresses
      const { axsToken, slpToken } = await this.getTokenAddresses();
      
      // Check AXS allowance
      const axsAllowance = await this.publicClient.readContract({
        address: axsToken,
        abi: [
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'allowance',
        args: [userAddress, this.contractAddress],
      }) as bigint;

      // Check SLP allowance
      const slpAllowance = await this.publicClient.readContract({
        address: slpToken,
        abi: [
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'allowance',
        args: [userAddress, this.contractAddress],
      }) as bigint;

      return {
        axsApproved: axsAllowance >= costs.axsAmount,
        slpApproved: slpAllowance >= costs.slpAmount,
        axsAllowance,
        slpAllowance,
      };
    } catch (error) {
      throw new Error(`Failed to check token approvals: ${error}`);
    }
  }

  /**
   * Get token addresses
   */
  async getTokenAddresses(): Promise<{
    axsToken: Address;
    slpToken: Address;
  }> {
    try {
      const [axsToken, slpToken] = await Promise.all([
        this.publicClient.readContract({
          address: this.contractAddress,
          abi: MATERIALVALIDATORTESTNET_ABI,
          functionName: 'axsToken',
        }),
        this.publicClient.readContract({
          address: this.contractAddress,
          abi: MATERIALVALIDATORTESTNET_ABI,
          functionName: 'slpToken',
        }),
      ]);

      return {
        axsToken: axsToken as Address,
        slpToken: slpToken as Address,
      };
    } catch (error) {
      throw new Error(`Failed to get token addresses: ${error}`);
    }
  }

  /**
   * Get treasury address
   */
  async getTreasury(): Promise<Address> {
    try {
      const treasury = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: MATERIALVALIDATORTESTNET_ABI,
        functionName: 'treasury',
      });

      return treasury as Address;
    } catch (error) {
      throw new Error(`Failed to get treasury address: ${error}`);
    }
  }
}
