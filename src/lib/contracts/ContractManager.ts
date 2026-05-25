/**
 * ContractManager - Singleton Pattern (GoF)
 * Gestiona la creación y el acceso centralizado a todas las instancias de contratos
 * 
 * ✅ REFACTORIZADO: Ahora usa Factory Registry Pattern para mejor modularidad
 * 
 * Combina múltiples patrones:
 * - Singleton: Única instancia global
 * - Factory Registry: Registro dinámico de factories (✅ NUEVO)
 * - Factory Method: Delega creación a factories específicas
 * - Registry: Mantiene registro de contratos instanciados
 * - Lazy Initialization: Crea contratos solo cuando se necesitan
 * - Rate Limiting: Aplica Proxy Pattern para control de llamadas
 * 
 * 🎯 Ventajas del nuevo sistema:
 * - ✅ Open/Closed Principle: Agregar nuevos contratos en 1 línea
 * - ✅ Single Responsibility: Cada factory tiene 1 responsabilidad
 * - ✅ Type Safety: Método genérico getContract<T>()
 * - ✅ Mantenibilidad: Código más limpio y escalable
 * 
 * @example
 * // ✅ NUEVO: Método genérico
 * const geodeHatcher = contractManager.getContract<IGeodeHatcher>('GeodeHatcher');
 * 
 * // ⚠️ LEGACY: Métodos específicos (mantenidos por compatibilidad)
 * const geodeHatcher = contractManager.getGeodeHatcher();
 */

import type { Address } from 'viem';
import type { Signer, Provider } from 'ethers';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { createRateLimitedContract } from '@/lib/utils/network/RateLimitedContract';

const log = createServiceLogger('ContractManager');

import { ForgeContractFactory } from './factories/ForgeContractFactory';
import { NFTContractFactory } from './factories/NFTContractFactory';
import { MiningPoolFactory } from './factories/MiningPoolFactory';
import { MinerStatsManagerFactory } from './factories/MinerStatsManagerFactory';
import { ERC20Factory } from './factories/ERC20Factory';
import { CycleContractFactory } from './factories/CycleContractFactory';
import { fCoreTokenFactory } from './factories/fCoreTokenFactory';
import { fCoreConverterFactory } from './factories/fCoreConverterFactory';
import { PohOracleFactory } from './factories/PohOracleFactory';
import { AxieContractFactory } from './factories/AxieContractFactory';
import { AxieStakingManagerFactory } from './factories/AxieStakingManagerFactory';
import { CycleManagerFactory } from './factories/CycleManagerFactory';
import { TrustScoreManagerFactory } from './factories/TrustScoreManagerFactory';
import { RoyaltyManagerFactory } from './factories/RoyaltyManagerFactory';
import { BuyBackFundFactory } from './factories/BuyBackFundFactory';
import { VestingManagerFactory } from './factories/VestingManagerFactory';
import { EmissionScheduleFactory } from './factories/EmissionScheduleFactory';
import { RecipeRegistryFactory } from './factories/RecipeRegistryFactory';
import { PriceOracleFactory } from './factories/PriceOracleFactory';
import { CollectionTrackerFactory } from './factories/CollectionTrackerFactory';
import { SetRegistryFactory } from './factories/SetRegistryFactory';
import { GeodeHatcherFactory } from './factories/GeodeHatcherFactory';
import { GeodeStakingManagerFactory } from './factories/GeodeStakingManagerFactory';
import { CoreMinerStakingManagerFactory } from './factories/CoreMinerStakingManagerFactory';
import { ScholarshipManagerFactory } from './factories/ScholarshipManagerFactory';
import { MinigameManagerFactory } from './factories/MinigameManagerFactory';
import { PvPArenaFactory } from './factories/PvPArenaFactory';
import { getContractAddress, type ContractName } from '@/lib/config/deployment.config';
import type { IForgeContract, IMiningContract, IERC20Contract, IMinerStatsManager, ICycleContract, IFCoreToken, IFCoreConverter, IPohContract, IAxieContract, IAxieStakingManager, ITrustScoreContract, IRoyaltyContract, IBuyBackFund, IVestingManager, IEmissionSchedule, IRecipeRegistry, IPriceOracle, ICollectionTracker, ISetRegistry, IGeodeHatcher, IGeodeStakingManager, ICoreMinerStakingManager, IScholarshipManager, IMinigameManager, IPvPArena } from './interfaces';

/**
 * Configuración global del ContractManager
 */
export interface ContractManagerConfig {
  chainId: number;
  provider?: Provider;
  signer?: Signer;
}

/**
 * Factory base con método create genérico
 */
interface BaseFactory<T = any> {
  create(address: Address, signerOrProvider: Signer | Provider, chainId?: number): T;
  createForgeFactory?(config: any): T;
  createMiningPool?(config: any): T;
  createMinerStatsManager?(config: any): T;
  // Métodos legacy para compatibilidad
}

/**
 * Registro de factories con metadata
 * Patrón: Registry + Factory Method (GoF)
 */
interface FactoryRegistryEntry {
  factory: any;
  createMethod: string; // 'create' | 'createForgeFactory' | etc.
  requiresChainId?: boolean;
}

/**
 * Tipo de contrato genérico para caché
 */
type CachedContract = IForgeContract | IMiningContract | IERC20Contract | IMinerStatsManager | ICycleContract | IGeodeHatcher | any;

/**
 * ContractManager - Singleton
 * Punto de acceso centralizado para todos los contratos
 * 
 * Patrón: Singleton (GoF)
 */
export class ContractManager {
  private static instance: ContractManager;
  private config: ContractManagerConfig;
  
  // ✅ Nuevo: Caché con Map para mejor performance
  private cache: Map<string, CachedContract> = new Map();
  
  // ✅ Nuevo: Factory Registry dinámico
  private factoryRegistry: Map<string, FactoryRegistryEntry> = new Map();
  
  // ✅ ELIMINADO: Factories legacy ya no necesarias - usar factoryRegistry
  
  /**
   * Constructor privado (Singleton pattern)
   */
  private constructor(config: ContractManagerConfig) {
    log.info('ContractManager initializing', {
      chainId: config.chainId,
      hasProvider: !!config.provider,
      hasSigner: !!config.signer,
    });
    this.config = config;
    this.initializeFactoryRegistry();
  }
  
  /**
   * ✅ Inicializa el registry de factories (Open/Closed Principle)
   * Agregar nuevos contratos aquí en 1 línea
   */
  private initializeFactoryRegistry(): void {
    // Forge System
    this.registerFactory('ForgeFactory', ForgeContractFactory, 'createForgeFactory', true);
    this.registerFactory('GeodeHatcher', GeodeHatcherFactory, 'create');
    
    // NFT System
    this.registerFactory('GeodeNFT', NFTContractFactory, 'createGeodeNFT', true);
    this.registerFactory('CoreMinerNFT', NFTContractFactory, 'createCoreMinerNFT', true);
    
    // Mining System
    this.registerFactory('MiningPool', MiningPoolFactory, 'createMiningPool', true);
    this.registerFactory('MinerStatsManager', MinerStatsManagerFactory, 'createMinerStatsManager', true);
    this.registerFactory('CycleManager', CycleManagerFactory, 'createCycleManager', true);
    
    // Token System
    this.registerFactory('CoreToken', ERC20Factory, 'createERC20', true);
    this.registerFactory('fCoreToken', fCoreTokenFactory, 'createfCoreToken', true);
    this.registerFactory('fCoreConverter', fCoreConverterFactory, 'createfCoreConverter', true);
    
    // Economy System
    this.registerFactory('PriceOracle', PriceOracleFactory, 'create');
    this.registerFactory('BuyBackFund', BuyBackFundFactory, 'createBuyBackFund', true);
    this.registerFactory('VestingManager', VestingManagerFactory, 'createVestingManager', true);
    this.registerFactory('EmissionSchedule', EmissionScheduleFactory, 'createEmissionSchedule', true);
    
    // Governance & Reputation
    this.registerFactory('ProofOfHumanityOracle', PohOracleFactory, 'createPohOracle', true);
    this.registerFactory('TrustScoreManager', TrustScoreManagerFactory, 'createTrustScoreManager', true);
    this.registerFactory('RoyaltyManager', RoyaltyManagerFactory, 'createRoyaltyManager', true);
    
    // Staking & Integration
    this.registerFactory('AxieStakingManager', AxieStakingManagerFactory, 'createAxieStakingManager', true);
    this.registerFactory('GeodeStakingManager', GeodeStakingManagerFactory, 'create');
    this.registerFactory('CoreMinerStakingManager', CoreMinerStakingManagerFactory, 'create');
    
    // Economy & Gaming (Phase 3)
    this.registerFactory('ScholarshipManager', ScholarshipManagerFactory, 'create');
    this.registerFactory('MinigameManager', MinigameManagerFactory, 'create');
    this.registerFactory('PvPArena', PvPArenaFactory, 'create');
    
    // Recipe & Collection System
    this.registerFactory('RecipeRegistry', RecipeRegistryFactory, 'create');
    this.registerFactory('UserCollectionTracker', CollectionTrackerFactory, 'create');
    this.registerFactory('SetRegistry', SetRegistryFactory, 'create');
    
    log.info(`Factory registry initialized with ${this.factoryRegistry.size} contracts`);
  }
  
  /**
   * ✅ Registra una factory en el registry
   * Detecta si el método es estático o de instancia
   */
  private registerFactory(
    contractName: string,
    FactoryClass: any,
    createMethod: string = 'create',
    requiresChainId: boolean = false
  ): void {
    try {
      // ✅ Si el método es estático, guardar la clase
      // ✅ Si es de instancia, guardar una instancia
      const isStatic = typeof FactoryClass[createMethod] === 'function';
      const factory = isStatic ? FactoryClass : new FactoryClass();
      
      this.factoryRegistry.set(contractName, {
        factory,
        createMethod,
        requiresChainId
      });
      
      log.debug(`Registered factory: ${contractName} (${isStatic ? 'static' : 'instance'} method)`);
    } catch (error) {
      log.error(`Failed to register factory: ${contractName}`, error);
    }
  }
  
  // ✅ ELIMINADO: initializeLegacyFactories() - Ya no es necesario
  
  /**
   * Obtiene o crea la instancia única (Singleton)
   */
  static getInstance(config?: ContractManagerConfig): ContractManager {
    if (!ContractManager.instance) {
      if (!config) {
        throw new Error('ContractManager requires initial configuration');
      }
      console.log('🔍 [ContractManager] Creating NEW instance with chainId:', config.chainId);
      ContractManager.instance = new ContractManager(config);
    } else if (config) {
      const currentConfig = ContractManager.instance.config;
      
      // Verificar si algo cambió (chainId, signer, o provider)
      const chainIdChanged = config.chainId !== currentConfig.chainId;
      const signerChanged = config.signer !== currentConfig.signer;
      const providerChanged = config.provider !== currentConfig.provider;
      
      if (chainIdChanged || signerChanged || providerChanged) {
        console.log('🔍 [ContractManager] Config changed:', {
          chainIdChanged,
          signerChanged: signerChanged ? `${!!currentConfig.signer} → ${!!config.signer}` : false,
          providerChanged,
        });
        ContractManager.instance.updateConfig(config);
      }
    }
    return ContractManager.instance;
  }
  
  /**
   * Actualiza la configuración (provider/signer)
   */
  updateConfig(config: Partial<ContractManagerConfig>): void {
    log.info('ContractManager config updating', {
      oldChainId: this.config.chainId,
      newChainId: config.chainId,
    });
    this.config = { ...this.config, ...config };
    this.clearCache();
  }
  
  /**
   * ✅ NUEVO: Método genérico para obtener cualquier contrato (Open/Closed Principle)
   * 
   * @example
   * const geodeHatcher = contractManager.getContract<IGeodeHatcher>('GeodeHatcher');
   */
  getContract<T = any>(contractName: ContractName, address?: Address): T {
    const cacheKey = this.getCacheKey(contractName, address);
    
    if (!this.cache.has(cacheKey)) {
      const contractAddress = address || getContractAddress(contractName);
      const registryEntry = this.factoryRegistry.get(contractName);
      
      if (!registryEntry) {
        throw new Error(`Contract factory not registered: ${contractName}`);
      }
      
      const { factory, createMethod, requiresChainId } = registryEntry;
      const signerOrProvider = this.config.signer || this.config.provider;
      
      if (!signerOrProvider) {
        throw new Error(`${contractName} requires a signer or provider`);
      }
      
      let contract: any;
      
      // ✅ Llamar al método create apropiado (estático o de instancia)
      if (requiresChainId && createMethod !== 'create') {
        // Métodos legacy que requieren config object
        contract = factory[createMethod]({
          address: contractAddress,
          chainId: this.config.chainId,
          signerOrProvider
        });
      } else if (createMethod === 'create') {
        // Método create estándar (puede ser estático o de instancia)
        contract = factory[createMethod](
          contractAddress,
          signerOrProvider,
          this.config.chainId
        );
      } else {
        // Fallback para otros métodos
        contract = factory[createMethod](contractAddress, signerOrProvider);
      }
      
      // Aplicar rate limiting
      const rateLimitedContract = createRateLimitedContract(contract, contractName);
      this.cache.set(cacheKey, rateLimitedContract);
      
      log.debug(`Contract created and cached: ${contractName}`);
    }
    
    return this.cache.get(cacheKey) as T;
  }
  
  /**
   * ⚠️ LEGACY: Obtiene un contrato del caché o lo crea
   * @deprecated Usar getContract<T>() en su lugar
   */
  private getOrCreateContract<ContractInstance>(
    cacheKey: string,
    contractFactory: () => ContractInstance
  ): ContractInstance {
    if (!this.cache.has(cacheKey)) {
      const contractInstance = contractFactory();
      const contractName = cacheKey.split('-')[0];
      const rateLimited = createRateLimitedContract(contractInstance as any, contractName);
      this.cache.set(cacheKey, rateLimited);
    }
    return this.cache.get(cacheKey) as ContractInstance;
  }
  
  /**
   * Genera una clave única para el caché
   */
  private getCacheKey(contractName: string, address?: Address): string {
    return `${contractName}-${address || getContractAddress(contractName as ContractName)}-${this.config.chainId}`;
  }
  
  // ============================================
  // Métodos públicos para obtener contratos
  // ============================================
  
  /**
   * ✅ Obtiene el contrato ForgeFactory (migrado a sistema genérico)
   */
  getForgeFactory(address?: Address): IForgeContract {
    return this.getContract<IForgeContract>('ForgeFactory', address);
  }
  
  /**
   * ✅ Obtiene el contrato MiningPool (migrado a sistema genérico)
   */
  getMiningPool(address?: Address): IMiningContract {
    return this.getContract<IMiningContract>('MiningPool', address);
  }
  
  /**
   * ✅ Obtiene el contrato MinerStatsManager (migrado a sistema genérico)
   */
  getMinerStatsManager(address?: Address): IMinerStatsManager {
    return this.getContract<IMinerStatsManager>('MinerStatsManager', address);
  }
  
  /**
   * ✅ Obtiene el contrato GeodeNFT (migrado a sistema genérico)
   */
  getGeodeNFT(address?: Address) {
    return this.getContract('GeodeNFT', address);
  }
  
  /**
   * ✅ Obtiene el contrato CoreMinerNFT (migrado a sistema genérico)
   */
  getCoreMinerNFT(address?: Address) {
    return this.getContract('CoreMinerNFT', address);
  }

  /**
   * ✅ Obtiene el contrato Axie NFT (migrado - usa 'axieNFT' como key)
   */
  getAxieContract(address?: Address): IAxieContract {
    // Nota: usa 'axieNFT' como key por compatibilidad
    const addr = address || getContractAddress('axieNFT') as Address;
    return this.getContract<IAxieContract>('axieNFT' as ContractName, addr);
  }
  
  /**
   * ✅ Obtiene una instancia de contrato ERC20 (migrado)
   */
  getERC20Token(tokenAddress: Address): IERC20Contract {
    return this.getContract<IERC20Contract>('CoreToken', tokenAddress);
  }
  
  /**
   * ✅ Obtiene el contrato CycleManager (migrado a sistema genérico)
   */
  getCycleManager(address?: Address): ICycleContract {
    return this.getContract<ICycleContract>('CycleManager', address);
  }

  /**
   * ✅ Obtiene el contrato fCoreToken (migrado a sistema genérico)
   */
  getfCoreToken(address?: Address): IFCoreToken {
    return this.getContract<IFCoreToken>('fCoreToken', address);
  }

  /**
   * ✅ Obtiene el contrato fCoreConverter (migrado a sistema genérico)
   */
  getfCoreConverter(address?: Address): IFCoreConverter {
    return this.getContract<IFCoreConverter>('fCoreConverter', address);
  }

  /**
   * ✅ Obtiene el contrato TrustScoreManager (migrado a sistema genérico)
   */
  getTrustScoreManager(address?: Address): ITrustScoreContract {
    return this.getContract<ITrustScoreContract>('TrustScoreManager', address);
  }

  /**
   * ✅ Obtiene el contrato RoyaltyManager (migrado a sistema genérico)
   */
  getRoyaltyManager(address?: Address): IRoyaltyContract {
    return this.getContract<IRoyaltyContract>('RoyaltyManager', address);
  }

  /**
   * ✅ Obtiene el contrato BuyBackFund (migrado a sistema genérico)
   */
  getBuyBackFund(address?: Address): IBuyBackFund {
    return this.getContract<IBuyBackFund>('BuyBackFund', address);
  }

  /**
   * ✅ Obtiene el contrato VestingManager (migrado a sistema genérico)
   */
  getVestingManager(address?: Address): IVestingManager {
    return this.getContract<IVestingManager>('VestingManager', address);
  }

  /**
   * ✅ Obtiene el contrato ProofOfHumanityOracle (migrado a sistema genérico)
   */
  getPohOracle(address?: Address): IPohContract {
    return this.getContract<IPohContract>('ProofOfHumanityOracle', address);
  }

  /**
   * ✅ Obtiene el contrato AxieStakingManager (migrado a sistema genérico)
   */
  getAxieStakingManager(address?: Address): IAxieStakingManager {
    return this.getContract<IAxieStakingManager>('AxieStakingManager', address);
  }

  /**
   * ✅ Obtiene el contrato EmissionSchedule (migrado a sistema genérico)
   */
  getEmissionSchedule(address?: Address): IEmissionSchedule {
    return this.getContract<IEmissionSchedule>('EmissionSchedule', address);
  }

  /**
   * ✅ Obtiene el contrato RecipeRegistry (migrado a sistema genérico)
   */
  getRecipeRegistry(address?: Address): IRecipeRegistry {
    return this.getContract<IRecipeRegistry>('RecipeRegistry', address);
  }

  /**
   * ✅ Obtiene el contrato PriceOracle (migrado a sistema genérico)
   */
  getPriceOracle(address?: Address): IPriceOracle {
    return this.getContract<IPriceOracle>('PriceOracle', address);
  }

  /**
   * ✅ Obtiene el contrato UserCollectionTracker (migrado a sistema genérico)
   */
  getCollectionTracker(address?: Address): ICollectionTracker {
    return this.getContract<ICollectionTracker>('UserCollectionTracker', address);
  }

  /**
   * ✅ Obtiene el contrato SetRegistry (migrado a sistema genérico)
   */
  getSetRegistry(address?: Address): ISetRegistry {
    return this.getContract<ISetRegistry>('SetRegistry', address);
  }

  /**
   * ✅ Obtiene el contrato GeodeHatcher (usando nuevo sistema genérico)
   */
  getGeodeHatcher(address?: Address): IGeodeHatcher {
    return this.getContract<IGeodeHatcher>('GeodeHatcher', address);
  }

  /**
   * ✅ Obtiene el contrato GeodeStakingManager
   */
  getGeodeStakingManager(address?: Address): IGeodeStakingManager {
    return this.getContract<IGeodeStakingManager>('GeodeStakingManager', address);
  }

  /**
   * ✅ Obtiene el contrato CoreMinerStakingManager
   */
  getCoreMinerStakingManager(address?: Address): ICoreMinerStakingManager {
    return this.getContract<ICoreMinerStakingManager>('CoreMinerStakingManager', address);
  }

  /**
   * ✅ Obtiene el contrato ScholarshipManager
   */
  getScholarshipManager(address?: Address): IScholarshipManager {
    return this.getContract<IScholarshipManager>('ScholarshipManager', address);
  }

  /**
   * ✅ Obtiene el contrato MinigameManager
   */
  getMinigameManager(address?: Address): IMinigameManager {
    return this.getContract<IMinigameManager>('MinigameManager', address);
  }

  /**
   * ✅ Obtiene el contrato PvPArena
   */
  getPvPArena(address?: Address): IPvPArena {
    return this.getContract<IPvPArena>('PvPArena', address);
  }

  /**
   * Obtiene el provider configurado
   */
  getProvider(): Provider | undefined {
    return this.config.provider;
  }

  /**
   * Obtiene el signer configurado
   */
  getSigner(): Signer | undefined {
    return this.config.signer;
  }

  /**
   * Obtiene el chainId actual
   */
  getChainId(): number {
    return this.config.chainId;
  }

  /**
   * Limpia la caché de contratos
   */
  clearCache(): void {
    this.cache.clear();
    log.info('Contract cache cleared');
  }

  /**
   * Obtiene información del estado actual
   */
  getStatus() {
    return {
      chainId: this.config.chainId,
      hasProvider: !!this.config.provider,
      hasSigner: !!this.config.signer,
      cacheSize: this.cache.size,
      registeredFactories: this.factoryRegistry.size,
      registeredContracts: Array.from(this.factoryRegistry.keys()),
    };
  }
  
  /**
   * Pre-carga contratos críticos
   * Útil para optimizar la primera carga
   */
  async preloadCriticalContracts(): Promise<void> {
    const criticalContractLoaders = [
      () => this.getForgeFactory(),
      () => this.getMiningPool(),
      () => this.getMinerStatsManager(),
    ];
    
    // Cargar en paralelo
    await Promise.all(
      criticalContractLoaders.map(contractLoader => {
        try {
          contractLoader();
          return Promise.resolve();
        } catch (error) {
          log.warn('Failed to preload contract', { error, contractName: name });
          return Promise.resolve();
        }
      })
    );
  }
  
  /**
   * Resetea el singleton (solo para testing)
   */
  static reset(): void {
    if (ContractManager.instance) {
      ContractManager.instance.clearCache();
      ContractManager.instance = null as any;
    }
  }
}

/**
 * Hook helper para usar en React components
 * Exporta una función helper para facilitar el uso
 */
export function getContractManager(config?: ContractManagerConfig): ContractManager {
  return ContractManager.getInstance(config);
}
