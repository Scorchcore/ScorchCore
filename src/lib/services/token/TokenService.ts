/**
 * TokenService - Servicio de Lógica de Negocio para Tokens ERC20
 * 
 * Gestiona operaciones con tokens (balances, aprobaciones, transferencias)
 * usando la nueva arquitectura
 * 
 * @pattern Service Layer (DDD)
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { ethers } from 'ethers';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import type {
  TokenBalance,
  TokenBalances,
  TokenApproval,
  TokenConfig,
  TokenInfo,
  ITokenService,
} from './types';

const log = createServiceLogger('TokenService');

/**
 * Implementación del servicio de gestión de tokens ERC20
 * 
 * @pattern Service Layer (DDD)
 * @pattern Strategy (GoF) - Implementa ITokenService
 */
export class TokenService implements ITokenService {
  constructor(private contractManager: ContractManager) {}

  /**
   * Obtiene el balance crudo de un token
   */
  async getBalance(tokenAddress: Address, userAddress: Address): Promise<bigint> {
    log.info('Getting balance', { token: tokenAddress, user: userAddress });
    
    const tokenContract = this.contractManager.getERC20Token(tokenAddress);
    return await tokenContract.balanceOf(userAddress);
  }

  /**
   * Obtiene el balance formateado de un token
   */
  async getFormattedBalance(
    tokenAddress: Address,
    userAddress: Address,
    decimals: number = 18
  ): Promise<string> {
    const balance = await this.getBalance(tokenAddress, userAddress);
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Obtiene balances de múltiples tokens
   */
  async getMultipleBalances(
    tokens: Array<TokenConfig>,
    userAddress: Address
  ): Promise<TokenBalances> {
    log.info('Getting multiple balances', { count: tokens.length, user: userAddress });

    const balances: TokenBalances = {};

    await Promise.all(
      tokens.map(async (token) => {
        const balance = await this.getBalance(token.address, userAddress);
        const decimals = token.decimals ?? 18;
        const formatted = ethers.formatUnits(balance, decimals);

        balances[token.symbol] = {
          address: token.address,
          symbol: token.symbol,
          balance,
          decimals,
          formatted,
        };
      })
    );

    return balances;
  }

  /**
   * Verifica si hay aprobación suficiente
   */
  async checkApproval(
    tokenAddress: Address,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<TokenApproval> {
    log.info('Checking approval', { token: tokenAddress, owner, spender });

    const allowance = await this.getAllowance(tokenAddress, owner, spender);
    const isApproved = allowance >= amount;

    return {
      token: tokenAddress,
      owner,
      spender,
      allowance,
      isApproved,
    };
  }

  /**
   * Aprueba un spender para gastar una cantidad específica
   */
  async approve(
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ): Promise<{ hash: string; success: boolean }> {
    log.info('Approving', { token: tokenAddress, spender, amount: amount.toString() });

    const tokenContract = this.contractManager.getERC20Token(tokenAddress);
    const tx = await tokenContract.approve(spender, amount);

    return {
      hash: tx.hash || '',
      success: true,
    };
  }

  /**
   * Aprueba cantidad máxima
   */
  async approveMax(
    tokenAddress: Address,
    spender: Address
  ): Promise<{ hash: string; success: boolean }> {
    const maxAmount = ethers.MaxUint256;
    return this.approve(tokenAddress, spender, maxAmount);
  }

  /**
   * Revoca aprobación (aprueba 0)
   */
  async revokeApproval(
    tokenAddress: Address,
    spender: Address
  ): Promise<{ hash: string; success: boolean }> {
    return this.approve(tokenAddress, spender, 0n);
  }

  /**
   * Obtiene información completa de un token
   */
  async getTokenInfo(tokenAddress: Address): Promise<TokenInfo> {
    log.info('Getting token info', { token: tokenAddress });

    const tokenContract = this.contractManager.getERC20Token(tokenAddress);

    const [symbol, name, decimals, totalSupply] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.name(),
      tokenContract.decimals(),
      tokenContract.totalSupply(),
    ]);

    return {
      symbol,
      name,
      decimals,
      totalSupply,
    };
  }

  /**
   * Obtiene la cantidad permitida (allowance)
   */
  async getAllowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<bigint> {
    const tokenContract = this.contractManager.getERC20Token(tokenAddress);
    return await tokenContract.allowance(owner, spender);
  }
}

/**
 * Factory function para crear instancias del servicio
 */
export function createTokenService(contractManager: ContractManager): TokenService {
  return new TokenService(contractManager);
}
