/**
 * Token Approval Service
 * Modular service for handling ERC20 token approvals
 * @module TokenApprovalService
 */

import { Address, PublicClient, WalletClient } from 'viem';

/**
 * ERC20 ABI for approval functions
 */
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

export interface ApprovalStatus {
  isApproved: boolean;
  currentAllowance: bigint;
  requiredAmount: bigint;
  hasBalance: boolean;
  balance: bigint;
}

export interface ApprovalResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Token Approval Service
 * Handles ERC20 token approvals with balance checks
 */
export class TokenApprovalService {
  constructor(
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  /**
   * Check approval status for a token
   * @param tokenAddress Token contract address
   * @param ownerAddress Owner wallet address
   * @param spenderAddress Spender contract address
   * @param requiredAmount Required approval amount
   * @returns Approval status including balance check
   */
  async checkApproval(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address,
    requiredAmount: bigint
  ): Promise<ApprovalStatus> {
    try {
      // Check current allowance
      const allowance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
      }) as bigint;

      // Check balance
      const balance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [ownerAddress],
      }) as bigint;

      return {
        isApproved: allowance >= requiredAmount,
        currentAllowance: allowance,
        requiredAmount,
        hasBalance: balance >= requiredAmount,
        balance,
      };
    } catch (error) {
      throw new Error(`Failed to check token approval: ${error}`);
    }
  }

  /**
   * Approve token spending
   * @param tokenAddress Token contract address
   * @param spenderAddress Spender contract address
   * @param amount Amount to approve (use MaxUint256 for unlimited)
   * @returns Approval result
   */
  async approve(
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint
  ): Promise<ApprovalResult> {
    if (!this.walletClient) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    try {
      const { request } = await this.publicClient.simulateContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amount],
        account: this.walletClient!.account!,
      });

      const hash = await this.walletClient!.writeContract(request);

      // Wait for confirmation
      await this.publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to approve token: ${error}`,
      };
    }
  }

  /**
   * Approve multiple tokens in sequence
   * @param approvals Array of approval requests
   * @returns Array of approval results
   */
  async approveMultiple(
    approvals: Array<{
      tokenAddress: Address;
      spenderAddress: Address;
      amount: bigint;
    }>
  ): Promise<ApprovalResult[]> {
    const results: ApprovalResult[] = [];

    for (const approval of approvals) {
      const result = await this.approve(
        approval.tokenAddress,
        approval.spenderAddress,
        approval.amount
      );
      results.push(result);

      // Stop on first failure
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Check and approve if needed
   * @param tokenAddress Token contract address
   * @param ownerAddress Owner wallet address
   * @param spenderAddress Spender contract address
   * @param requiredAmount Required approval amount
   * @returns Approval result (skipped if already approved)
   */
  async ensureApproval(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address,
    requiredAmount: bigint
  ): Promise<ApprovalResult & { wasAlreadyApproved: boolean }> {
    const status = await this.checkApproval(
      tokenAddress,
      ownerAddress,
      spenderAddress,
      requiredAmount
    );

    if (status.isApproved) {
      return {
        success: true,
        wasAlreadyApproved: true,
      };
    }

    if (!status.hasBalance) {
      return {
        success: false,
        wasAlreadyApproved: false,
        error: `Insufficient balance. Required: ${requiredAmount}, Available: ${status.balance}`,
      };
    }

    const result = await this.approve(tokenAddress, spenderAddress, requiredAmount);

    return {
      ...result,
      wasAlreadyApproved: false,
    };
  }
}
