/**
 * fCoreService - Servicio de negocio para el sistema fCORE Anti-Bot
 * 
 * @pattern Service Layer Pattern
 * @pattern Facade Pattern - Simplifica interacción con múltiples contratos
 */

import type { Address } from 'viem';
import { formatUnits, parseUnits } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import type { 
  fCoreBalanceState, 
  PohVerificationInfo, 
  ConvertfCoreParams, 
  ConvertfCoreResult,
  fCoreSystemInfo 
} from './types';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('fCoreService');

/**
 * Servicio para gestionar operaciones del sistema fCORE
 */
export class fCoreService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene el estado de balance de fCORE de un usuario
   */
  async getfCoreBalance(userAddress: Address): Promise<fCoreBalanceState> {
    try {
      log.info('Getting fCORE balance', { userAddress });

      const fCoreToken = this.contractManager.getfCoreToken();
      const fCoreConverter = this.contractManager.getfCoreConverter();

      const [balance, canConvert, convertibleAmount, conversionRate] = await Promise.all([
        fCoreToken.balanceOf(userAddress),
        fCoreConverter.canConvert(userAddress),
        fCoreConverter.getConvertibleAmount(userAddress),
        fCoreConverter.getConversionRate(),
      ]);

      const balanceFormatted = formatUnits(balance, 18);

      log.info('fCORE balance retrieved', {
        userAddress,
        balance: balance.toString(),
        canConvert,
        convertibleAmount: convertibleAmount.toString(),
      });

      return {
        balance,
        balanceFormatted,
        canConvert,
        isPohVerified: canConvert && balance > 0n,
        convertibleAmount,
        conversionRate,
      };
    } catch (error) {
      log.error('Error getting fCORE balance', { userAddress, error });
      throw error;
    }
  }

  /**
   * Obtiene la información de verificación PoH de un usuario
   */
  async getPohVerification(userAddress: Address): Promise<PohVerificationInfo> {
    try {
      log.info('Getting PoH verification', { userAddress });

      const pohOracle = this.contractManager.getPohOracle();

      const [isVerified, verificationData] = await Promise.all([
        pohOracle.isHuman(userAddress),
        pohOracle.getVerificationData(userAddress),
      ]);

      const now = BigInt(Math.floor(Date.now() / 1000));
      const isExpired = verificationData.expiresAt > 0n && now > verificationData.expiresAt;

      log.info('PoH verification retrieved', {
        userAddress,
        isVerified,
        level: verificationData.level,
        isExpired,
      });

      return {
        isVerified,
        level: verificationData.level,
        timestamp: verificationData.timestamp,
        expiresAt: verificationData.expiresAt,
        isExpired,
      };
    } catch (error) {
      log.error('Error getting PoH verification', { userAddress, error });
      throw error;
    }
  }

  /**
   * Convierte fCORE a CORE
   */
  async convertfCore(params: ConvertfCoreParams): Promise<ConvertfCoreResult> {
    const { amount, userAddress } = params;

    try {
      log.info('Converting fCORE', { userAddress, amount: amount?.toString() });

      const fCoreConverter = this.contractManager.getfCoreConverter();

      // Verificar que el usuario puede convertir
      const canConvert = await fCoreConverter.canConvert(userAddress);
      if (!canConvert) {
        log.warn('User cannot convert fCORE - PoH not verified or no balance', { userAddress });
        return {
          success: false,
          fCoreConverted: 0n,
          coreReceived: 0n,
          error: 'No tienes verificación PoH o no tienes balance de fCORE',
        };
      }

      // Convertir todo o cantidad específica
      const result = amount 
        ? await fCoreConverter.convert(amount)
        : await fCoreConverter.convertAll();

      if (!result.success) {
        log.error('Conversion failed', { userAddress, error: result.error });
        return {
          success: false,
          fCoreConverted: 0n,
          coreReceived: 0n,
          error: result.error?.message || 'Error al convertir fCORE',
        };
      }

      // La conversión es 1:1, así que fCore convertido = Core recibido
      const fCoreConverted = amount || await fCoreConverter.getConvertibleAmount(userAddress);
      const coreReceived = fCoreConverted; // 1:1 ratio

      log.info('fCORE converted successfully', {
        userAddress,
        txHash: result.hash,
        fCoreConverted: fCoreConverted.toString(),
        coreReceived: coreReceived.toString(),
      });

      return {
        success: true,
        txHash: result.hash,
        fCoreConverted,
        coreReceived,
      };
    } catch (error) {
      log.error('Error converting fCORE', { userAddress, amount: amount?.toString(), error });
      return {
        success: false,
        fCoreConverted: 0n,
        coreReceived: 0n,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene información consolidada del sistema fCORE para un usuario
   */
  async getSystemInfo(userAddress: Address): Promise<fCoreSystemInfo> {
    try {
      log.info('Getting fCORE system info', { userAddress });

      const [fCoreBalance, pohVerification] = await Promise.all([
        this.getfCoreBalance(userAddress),
        this.getPohVerification(userAddress),
      ]);

      const canPerformConversion = 
        fCoreBalance.canConvert && 
        pohVerification.isVerified && 
        !pohVerification.isExpired &&
        fCoreBalance.balance > 0n;

      const estimatedCoreReceivable = fCoreBalance.convertibleAmount;

      return {
        fCoreBalance,
        pohVerification,
        canPerformConversion,
        estimatedCoreReceivable,
      };
    } catch (error) {
      log.error('Error getting fCORE system info', { userAddress, error });
      throw error;
    }
  }

  /**
   * Obtiene la tasa de conversión actual
   */
  async getConversionRate(): Promise<bigint> {
    try {
      const fCoreConverter = this.contractManager.getfCoreConverter();
      return await fCoreConverter.getConversionRate();
    } catch (error) {
      log.error('Error getting conversion rate', { error });
      throw error;
    }
  }

  /**
   * Formatea una cantidad de fCORE/CORE a string legible
   */
  formatTokenAmount(amount: bigint, decimals: number = 18): string {
    return formatUnits(amount, decimals);
  }

  /**
   * Parsea un string a cantidad de tokens
   */
  parseTokenAmount(amount: string, decimals: number = 18): bigint {
    return parseUnits(amount, decimals);
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createfCoreService(contractManager: ContractManager): fCoreService {
  return new fCoreService(contractManager);
}
