/**
 * Interface for MaterialValidator contract
 * @module IMaterialValidatorContract
 */

import { Address } from 'viem';

/**
 * Material costs for forging
 */
export interface MaterialCosts {
  axsAmount: bigint;  // AXS cost (testnet only)
  slpAmount: bigint;  // SLP cost
}

/**
 * Material Validator Contract Interface
 * Handles validation and charging of materials (AXS + SLP) for forging
 */
export interface IMaterialValidatorContract {
  /**
   * Get forging costs for a specific category
   * @param category Geode category (0-4)
   * @returns Material costs (AXS + SLP)
   */
  getCosts(category: number): Promise<MaterialCosts>;

  /**
   * Check if user has approved sufficient tokens
   * @param userAddress User's wallet address
   * @param category Geode category
   * @returns Object with approval status for each token
   */
  checkApprovals(userAddress: Address, category: number): Promise<{
    axsApproved: boolean;
    slpApproved: boolean;
    axsAllowance: bigint;
    slpAllowance: bigint;
  }>;

  /**
   * Get token addresses
   * @returns AXS and SLP token addresses
   */
  getTokenAddresses(): Promise<{
    axsToken: Address;
    slpToken: Address;
  }>;

  /**
   * Get treasury address
   * @returns Treasury address where tokens are sent
   */
  getTreasury(): Promise<Address>;
}
