/**
 * Sistema de logging centralizado para ScorchCoreWeb
 * 
 * Reemplaza los console.log dispersos con un sistema estructurado
 * que permite control de niveles, contexto y envío a servicios externos.
 * 
 * **Elimina ~50+ console.log dispersos** en el código.
 * 
 * @pattern Singleton
 * @principle SRP - Responsabilidad única: logging
 */

/**
 * Niveles de log disponibles
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Contexto adicional para logs
 */
export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  txHash?: string;
  minerId?: string;
  geodeId?: string;
  tokenAddress?: string;
  [key: string]: unknown;
}

/**
 * Configuración del logger
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  isDevelopment: boolean;
}

/**
 * Logger centralizado
 * 
 * Proporciona logging estructurado con niveles, contexto y
 * capacidad de enviar a servicios externos (Sentry, LogRocket).
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/utils/logger';
 * 
 * logger.info('Usuario conectado', { userId: address });
 * logger.error('Error en transacción', error, { txHash: '0x...' });
 * logger.transaction('Approval', txHash, true);
 * ```
 */
class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Configura el nivel de log
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Habilita/deshabilita logging en consola
   */
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * Verifica si debe loggear para un nivel dado
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Formatea un mensaje con timestamp y nivel
   */
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  /**
   * Log nivel DEBUG
   * 
   * Para información detallada de debugging.
   * Solo visible en desarrollo.
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG) && this.config.enableConsole) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  /**
   * Log nivel INFO
   * 
   * Para información general del flujo de la aplicación.
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO) && this.config.enableConsole) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  /**
   * Log nivel WARN
   * 
   * Para situaciones potencialmente problemáticas.
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN) && this.config.enableConsole) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  /**
   * Log nivel ERROR
   * 
   * Para errores que requieren atención.
   * En producción, envía a servicios externos.
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (this.config.enableConsole) {
        console.error(this.formatMessage('ERROR', message, context));
        if (error instanceof Error) {
          console.error(error.stack);
        } else if (error) {
          console.error(error);
        }
      }
      
      // En producción, enviar a servicio externo
      if (this.config.enableRemote) {
        this.sendToExternalService(message, error, context);
      }
    }
  }

  /**
   * Envía logs a servicio externo (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(
    message: string,
    error: Error | unknown,
    context?: LogContext
  ): void {
    // TODO: Integrar con Sentry cuando esté configurado
    // Sentry.captureException(error, {
    //   extra: { message, context }
    // });
  }

  // ==========================================
  // Métodos especializados para blockchain
  // ==========================================

  /**
   * Log para transacciones blockchain
   * 
   * @example
   * ```typescript
   * logger.transaction('Token Approval', txHash, result.success);
   * // Output: ✅ Transaction Token Approval: 0x123... (success: true)
   * ```
   */
  transaction(action: string, txHash: string, success: boolean): void {
    const emoji = success ? '✅' : '❌';
    this.info(`${emoji} Transaction ${action}`, {
      txHash,
      success,
      service: 'blockchain',
    });
  }

  /**
   * Log para llamadas a contratos
   * 
   * @example
   * ```typescript
   * logger.contractCall('MiningPool', 'startMining', { minerId: '1' });
   * ```
   */
  contractCall(contract: string, method: string, params?: Record<string, unknown>): void {
    this.debug(`Calling ${contract}.${method}`, {
      contract,
      method,
      params,
      service: 'blockchain',
    });
  }

  /**
   * Log para operaciones de caché
   * 
   * @example
   * ```typescript
   * logger.cache('HIT', 'balance-0x123-0xabc');
   * ```
   */
  cache(action: 'HIT' | 'MISS' | 'INVALIDATE' | 'CLEAR', key: string): void {
    this.debug(`Cache ${action}: ${key}`, { service: 'cache' });
  }

  /**
   * Log para operaciones de minería
   */
  mining(action: string, minerId: string | bigint, data?: Record<string, unknown>): void {
    this.info(`⛏️ Mining ${action}`, {
      minerId: minerId.toString(),
      service: 'mining',
      ...data,
    });
  }

  /**
   * Log para operaciones de forja
   */
  forge(action: string, geodeId: string | bigint | undefined, data?: Record<string, unknown>): void {
    this.info(`🔨 Forge ${action}`, {
      geodeId: geodeId?.toString(),
      service: 'forge',
      ...data,
    });
  }

  /**
   * Log para operaciones de NFT
   */
  nft(action: string, tokenId: string | bigint, data?: Record<string, unknown>): void {
    this.info(`🎨 NFT ${action}`, {
      tokenId: tokenId.toString(),
      service: 'nft',
      ...data,
    });
  }
}

// Singleton export
export const logger = new Logger();

/**
 * Helper para crear logger con contexto de servicio
 * 
 * Útil para servicios que hacen muchos logs.
 * 
 * @example
 * ```typescript
 * const log = createServiceLogger('TokenService');
 * log.debug('Getting balance', { tokenAddress, userAddress });
 * log.error('Failed to get balance', error);
 * ```
 */
export function createServiceLogger(serviceName: string) {
  return {
    debug: (message: string, context?: Omit<LogContext, 'service'>) =>
      logger.debug(message, { ...context, service: serviceName }),
    
    info: (message: string, context?: Omit<LogContext, 'service'>) =>
      logger.info(message, { ...context, service: serviceName }),
    
    warn: (message: string, context?: Omit<LogContext, 'service'>) =>
      logger.warn(message, { ...context, service: serviceName }),
    
    error: (message: string, error?: Error | unknown, context?: Omit<LogContext, 'service'>) =>
      logger.error(message, error, { ...context, service: serviceName }),
  };
}
