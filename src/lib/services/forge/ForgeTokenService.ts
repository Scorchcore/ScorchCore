/**
 * ForgeTokenService - Gestión de Tokens para Forja
 * 
 * Responsabilidad única: Balances y aprobaciones de tokens
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo gestiona tokens
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseForgeService } from '@/lib/services/base/BaseForgeService';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('ForgeTokenService');
import type { IForgeContract } from '@/lib/contracts/interfaces';
import type { TokenBalances, ApprovalStatus } from './types';
import { GeodeType, GEODE_COSTS } from './types';
import { TokenService } from '../token/TokenService';
import { TOKEN_ADDRESSES } from '@/lib/config/tokens';
import { parseUnits, formatUnits } from 'ethers';

/**
 * Servicio especializado en gestión de tokens para forja
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseForgeService para eliminar duplicación.
 */
export class ForgeTokenService extends BaseForgeService {
  private tokenService: TokenService;

  /**
   * @param contractManager - Gestor de contratos
   * @param tokenService - (Opcional) Servicio de tokens compartido
   */
  constructor(
    contractManager: ContractManager,
    tokenService?: TokenService
  ) {
    super(contractManager);
    this.tokenService = tokenService || new TokenService(contractManager);
  }

  /**
   * Obtiene los balances de tokens del usuario
   * 
   * Retorna todos los balances como strings formateados para consistencia:
   * - AXS: formato decimal (ej: "10.50")
   * - SLP: entero sin decimales (ej: "1000")
   * - Memento: entero sin decimales (ej: "5")
   * 
   * @param userAddress - Dirección del usuario
   * @returns Balances formateados como strings
   */
  async getTokenBalances(userAddress: Address): Promise<TokenBalances> {
    try {
      // Obtener AXS y SLP (siempre disponibles)
      const [axsBalanceRaw, slpBalanceRaw] = await Promise.all([
        this.tokenService.getBalance(TOKEN_ADDRESSES.AXS, userAddress),
        this.tokenService.getBalance(TOKEN_ADDRESSES.SLP, userAddress),
      ]);

      // Intentar obtener Memento, pero puede fallar si no existe en testnet
      let mementoBalanceRaw = BigInt(0);
      try {
        mementoBalanceRaw = await this.tokenService.getBalance(TOKEN_ADDRESSES.MEMENTO, userAddress);
      } catch (mementoError) {
        log.warn('MementoToken contract not available (likely testnet), defaulting to 0', {
          error: mementoError instanceof Error ? mementoError.message : String(mementoError)
        });
      }

      return {
        // AXS tiene 18 decimales - formato legible con 2 decimales
        axs: parseFloat(formatUnits(axsBalanceRaw, 18)).toFixed(2),
        // SLP sin decimales - formato directo
        slp: formatUnits(slpBalanceRaw, 0),
        // Memento sin decimales - formato directo (0 si no disponible)
        memento: formatUnits(mementoBalanceRaw, 0),
      };
    } catch (error) {
      log.error('Failed to get token balances', error);
      throw error;
    }
  }

  /**
   * Obtiene el balance de un token específico
   * 
   * @param tokenType - Tipo de token
   * @param userAddress - Dirección del usuario
   * @returns Balance del token
   */
  async getBalance(
    tokenType: 'axs' | 'slp' | 'memento',
    userAddress: Address
  ): Promise<string> {
    const balances = await this.getTokenBalances(userAddress);
    return balances[tokenType];
  }

  /**
   * Verifica el estado de aprobaciones de tokens
   * 
   * @param userAddress - Dirección del usuario
   * @param geodeType - Tipo de geoda a forjar
   * @param mementosExtra - Mementos adicionales para bonos
   * @returns Estado de aprobación de cada token
   */
  async checkApprovals(
    userAddress: Address,
    geodeType: GeodeType,
    mementosExtra: number = 0
  ): Promise<ApprovalStatus> {
    try {
      const costs = GEODE_COSTS[geodeType];
      const forgeAddress = this.forgeContract.address;

      // Obtener aprobaciones de AXS y SLP (siempre disponibles)
      const [axsApproval, slpApproval] = await Promise.all([
        this.tokenService.checkApproval(
          TOKEN_ADDRESSES.AXS,
          userAddress,
          forgeAddress,
          BigInt(Math.floor(parseFloat(costs.axs) * 1e18))
        ),
        this.tokenService.checkApproval(
          TOKEN_ADDRESSES.SLP,
          userAddress,
          forgeAddress,
          BigInt(costs.slp)
        ),
      ]);

      // Intentar verificar aprobación de Memento, asumir aprobado si no existe
      let mementoApproval = { isApproved: true };
      try {
        mementoApproval = await this.tokenService.checkApproval(
          TOKEN_ADDRESSES.MEMENTO,
          userAddress,
          forgeAddress,
          BigInt(parseInt(costs.memento) + mementosExtra)
        );
      } catch (mementoError) {
        log.warn('MementoToken approval check failed (likely testnet), assuming approved', {
          error: mementoError instanceof Error ? mementoError.message : String(mementoError)
        });
      }

      return {
        axsApproved: axsApproval.isApproved,
        slpApproved: slpApproval.isApproved,
        mementoApproved: mementoApproval.isApproved,
      };
    } catch (error) {
      log.error('Failed to check approvals', error, { userAddress, geodeType });
      throw error;
    }
  }

  /**
   * Aprueba un token específico
   * 
   * @param tokenType - Tipo de token a aprobar
   * @param amount - Cantidad a aprobar
   * @returns Hash de la transacción
   */
  async approveToken(
    tokenType: 'axs' | 'slp' | 'memento',
    amount: string
  ): Promise<{ hash: string; success: boolean }> {
    try {
      const tokenAddresses = {
        axs: TOKEN_ADDRESSES.AXS,
        slp: TOKEN_ADDRESSES.SLP,
        memento: TOKEN_ADDRESSES.MEMENTO,
      };
      
      const decimals = tokenType === 'axs' ? 18 : 0;
      const amountBigInt = decimals > 0 ? parseUnits(amount, decimals) : BigInt(amount);

      // Si es memento y falla, asumir que no necesita aprobación (testnet)
      if (tokenType === 'memento') {
        try {
          return await this.tokenService.approve(
            tokenAddresses[tokenType],
            this.forgeContract.address,
            amountBigInt
          );
        } catch (mementoError) {
          log.warn('MementoToken approve failed (likely testnet), returning mock success', {
            error: mementoError instanceof Error ? mementoError.message : String(mementoError)
          });
          return { hash: '0x0', success: true };
        }
      }

      return await this.tokenService.approve(
        tokenAddresses[tokenType],
        this.forgeContract.address,
        amountBigInt
      );
    } catch (error) {
      log.error(`Failed to approve ${tokenType}`, error);
      throw error;
    }
  }

  /**
   * Aprueba todos los tokens necesarios para forjar
   * 
   * @param geodeType - Tipo de geoda
   * @param mementosExtra - Mementos adicionales
   */
  async approveAllTokens(
    geodeType: GeodeType,
    mementosExtra: number = 0
  ): Promise<void> {
    try {
      const costs = GEODE_COSTS[geodeType];
      
      log.info('Approving all tokens for geode type', { 
        geodeType,
        costs: {
          axs: costs.axs,
          slp: costs.slp,
          memento: costs.memento
        },
        mementosExtra
      });
      
      await Promise.all([
        this.approveToken('axs', costs.axs),
        this.approveToken('slp', costs.slp),
        this.approveToken('memento', (parseInt(costs.memento) + mementosExtra).toString()),
      ]);
      
      log.info('All tokens approved successfully', { geodeType });
    } catch (error) {
      log.error('Failed to approve all tokens', error, { geodeType });
      throw error;
    }
  }

  /**
   * Revoca la aprobación de un token
   * 
   * @param tokenType - Tipo de token
   * @returns Hash de la transacción
   */
  async revokeApproval(
    tokenType: 'axs' | 'slp' | 'memento'
  ): Promise<{ hash: string; success: boolean }> {
    try {
      return await this.approveToken(tokenType, '0');
    } catch (error) {
      log.error(`Failed to revoke ${tokenType} approval`, error);
      throw error;
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createForgeTokenService(
  contractManager: ContractManager,
  tokenService?: TokenService
): ForgeTokenService {
  return new ForgeTokenService(contractManager, tokenService);
}
