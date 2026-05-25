/**
 * TokenServiceCache - Optimización con caché para TokenService
 * 
 * Implementa patrón Proxy para cachear lecturas frecuentes y reducir
 * llamadas blockchain innecesarias.
 * 
 * @pattern Proxy (GoF)
 * @pattern Decorator
 */

import type { Address } from 'viem';
import type { 
  ITokenService,
  TokenBalance, 
  TokenBalances, 
  TokenApproval,
  TokenConfig,
  TokenInfo
} from './types';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('TokenServiceCache');

/**
 * Configuración del caché
 */
interface CacheConfig {
  /** Tiempo de vida del caché en milisegundos (default: 30s) */
  ttl?: number;
  /** Habilitar logging de caché (default: false) */
  debug?: boolean;
}

/**
 * Entrada de caché con timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * TokenServiceCache - Decorator con caché para ITokenService
 * 
 * @pattern Decorator (GoF)
 * @principle LSP - Liskov Substitution Principle respetado
 * @principle Composition over Inheritance
 */
export class TokenServiceCache implements ITokenService {
  private readonly baseService: ITokenService;
  private readonly balanceCache: Map<string, CacheEntry<bigint>>;
  private readonly tokenInfoCache: Map<Address, CacheEntry<TokenInfo>>;
  private readonly multiBalanceCache: Map<string, CacheEntry<TokenBalances>>;
  private readonly ttl: number;
  private readonly debug: boolean;

  constructor(
    baseService: ITokenService,
    config: CacheConfig = {}
  ) {
    this.baseService = baseService;
    this.balanceCache = new Map();
    this.tokenInfoCache = new Map();
    this.multiBalanceCache = new Map();
    this.ttl = config.ttl || 30000;
    this.debug = config.debug || false;
  }

  private getBalanceCacheKey(tokenAddress: Address, userAddress: Address): string {
    return `${tokenAddress.toLowerCase()}-${userAddress.toLowerCase()}`;
  }

  private isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    const now = Date.now();
    const isValid = (now - entry.timestamp) < this.ttl;
    
    if (this.debug) {
      const age = now - entry.timestamp;
      log.debug('Cache validation check', { age, isValid, ttl: this.ttl });
    }
    
    return isValid;
  }

  async getBalance(tokenAddress: Address, userAddress: Address): Promise<bigint> {
    const cacheKey = this.getBalanceCacheKey(tokenAddress, userAddress);
    const cached = this.balanceCache.get(cacheKey);

    if (this.isCacheValid(cached)) {
      if (this.debug) log.debug('Cache hit - balance', { cacheKey });
      return cached!.data;
    }

    if (this.debug) log.debug('Cache miss - balance', { cacheKey });

    const balance = await this.baseService.getBalance(tokenAddress, userAddress);
    
    this.balanceCache.set(cacheKey, {
      data: balance,
      timestamp: Date.now(),
    });

    return balance;
  }

  async getFormattedBalance(
    tokenAddress: Address,
    userAddress: Address,
    decimals: number = 18
  ): Promise<string> {
    const balance = await this.getBalance(tokenAddress, userAddress);
    const { ethers } = await import('ethers');
    return ethers.formatUnits(balance, decimals);
  }

  async getMultipleBalances(
    tokens: Array<TokenConfig>,
    userAddress: Address
  ): Promise<TokenBalances> {
    const cacheKey = `multi-${tokens.map(t => t.address).join(',')}-${userAddress}`;
    const cached = this.multiBalanceCache.get(cacheKey);

    if (this.isCacheValid(cached)) {
      if (this.debug) log.debug('Cache hit - multiple balances', { tokenCount: tokens.length });
      return cached!.data;
    }

    if (this.debug) log.debug('Cache miss - multiple balances', { tokenCount: tokens.length });

    const balances = await this.baseService.getMultipleBalances(tokens, userAddress);
    
    this.multiBalanceCache.set(cacheKey, {
      data: balances,
      timestamp: Date.now(),
    });

    return balances;
  }

  async getTokenInfo(tokenAddress: Address): Promise<TokenInfo> {
    const cached = this.tokenInfoCache.get(tokenAddress);

    if (this.isCacheValid(cached)) {
      if (this.debug) log.debug('Cache hit - token info', { tokenAddress });
      return cached!.data;
    }

    if (this.debug) log.debug('Cache miss - token info', { tokenAddress });

    const info = await this.baseService.getTokenInfo(tokenAddress);
    
    this.tokenInfoCache.set(tokenAddress, {
      data: info,
      timestamp: Date.now(),
    });

    return info;
  }

  invalidateBalance(tokenAddress: Address, userAddress: Address): void {
    const cacheKey = this.getBalanceCacheKey(tokenAddress, userAddress);
    this.balanceCache.delete(cacheKey);
    
    if (this.debug) log.debug('Cache invalidated - balance', { cacheKey });
  }

  invalidateAllBalances(): void {
    this.balanceCache.clear();
    this.multiBalanceCache.clear();
    
    if (this.debug) log.debug('Cache cleared - all balances');
  }

  invalidateTokenInfo(tokenAddress: Address): void {
    this.tokenInfoCache.delete(tokenAddress);
    
    if (this.debug) log.debug('Cache invalidated - token info', { tokenAddress });
  }

  clearCache(): void {
    this.balanceCache.clear();
    this.tokenInfoCache.clear();
    this.multiBalanceCache.clear();
    
    if (this.debug) log.debug('Cache cleared - all caches');
  }

  getCacheStats(): {
    balances: number;
    tokenInfo: number;
    multiBalances: number;
    total: number;
  } {
    return {
      balances: this.balanceCache.size,
      tokenInfo: this.tokenInfoCache.size,
      multiBalances: this.multiBalanceCache.size,
      total: this.balanceCache.size + this.tokenInfoCache.size + this.multiBalanceCache.size,
    };
  }

  async checkApproval(
    tokenAddress: Address,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<TokenApproval> {
    return this.baseService.checkApproval(tokenAddress, owner, spender, amount);
  }

  async approve(
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ): Promise<{ hash: string; success: boolean }> {
    const result = await this.baseService.approve(tokenAddress, spender, amount);
    
    if (result.success) {
      this.invalidateAllBalances();
    }
    
    return result;
  }

  async approveMax(
    tokenAddress: Address,
    spender: Address
  ): Promise<{ hash: string; success: boolean }> {
    const result = await this.baseService.approveMax(tokenAddress, spender);
    
    if (result.success) {
      this.invalidateAllBalances();
    }
    
    return result;
  }

  async revokeApproval(
    tokenAddress: Address,
    spender: Address
  ): Promise<{ hash: string; success: boolean }> {
    const result = await this.baseService.revokeApproval(tokenAddress, spender);
    
    if (result.success) {
      this.invalidateAllBalances();
    }
    
    return result;
  }

  async getAllowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<bigint> {
    return this.baseService.getAllowance(tokenAddress, owner, spender);
  }
}

/**
 * Factory para crear servicio con caché
 */
export function createCachedTokenService(
  baseService: ITokenService,
  config?: CacheConfig
): TokenServiceCache {
  return new TokenServiceCache(baseService, config);
}
