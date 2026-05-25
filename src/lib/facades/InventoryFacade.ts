/**
 * InventoryFacade - Facade para operaciones de inventario (geodas)
 * 
 * @pattern Facade (GoF)
 * @principle Single Responsibility - Maneja SOLO operaciones de inventario
 * @principle Dependency Inversion - Depende de abstracciones (IContractManager)
 */

import type { Address } from 'viem';
import type { ContractManager } from '../contracts/ContractManager';
import { createServiceLogger } from '../utils/logging/logger';
import { withRetry, isRetryableBlockchainError } from '../utils/network/retry';
import { 
  GeodeCategory,
  AxieClass,
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
  getGeodeName
} from '../constants/geodes';

const logger = createServiceLogger('InventoryFacade');

/**
 * Información completa de una geoda en inventario
 * Las geodas tienen poder de minado según whitepaper y pueden ir a staking
 */
export interface GeodeInventoryInfo {
  id: bigint;
  category: GeodeCategory;
  axieClass: AxieClass;
  categoryName: string;
  className: string;
  fullName: string;
  owner: string;
  createdAt: number;
  hatchTime: number;
  isHatched: boolean;
  canHatch: boolean;
  
  // Para staking: las geodas tienen poder de minado
  miningPower: number;
  efficiency: number;
  isStaked?: boolean;
}

/**
 * Facade para operaciones de inventario
 * Encapsula toda la lógica de geodas del usuario
 */
export class InventoryFacade {
  constructor(private contractManager: ContractManager) {}

  /**
   * Obtiene todas las geodas del usuario
   * Busca eventos GeodeForged y filtra por ownership actual
   */
  async getUserGeodes(userAddress: Address): Promise<GeodeInventoryInfo[]> {
    logger.info('📦 Cargando geodas del usuario', { userAddress });

    try {
      const geodeContract = this.contractManager.getGeodeNFT();
      const forgeContract = this.contractManager.getForgeFactory();

      // Obtener bloques para búsqueda
      const provider = this.contractManager.getProvider();
      if (!provider) {
        throw new Error('Provider no disponible');
      }
      const currentBlock = await provider.getBlockNumber();
      
      // Buscar en últimos 10000 bloques con chunks de 499
      const totalBlocksToSearch = 10000;
      const chunkSize = 499;
      const startBlock = Math.max(0, currentBlock - totalBlocksToSearch);
      
      logger.debug(`Buscando eventos desde bloque ${startBlock} hasta ${currentBlock}`);
      
      // Buscar eventos GeodeForged del usuario
      const allForgedEvents = await this.searchForgedEventsInChunks(
        forgeContract,
        userAddress,
        startBlock,
        currentBlock,
        chunkSize
      );

      logger.info(`✅ Encontrados ${allForgedEvents.length} eventos GeodeForged`);

      if (allForgedEvents.length === 0) {
        return [];
      }

      // ✅ Extraer IDs y crear mapa de eventos con timestamp correcto
      const geodeEventsMap = new Map<string, any>();
      
      // ✅ Obtener timestamps de bloques para cada evento
      const blockTimestampsCache = new Map<number, number>();
      
      for (const event of allForgedEvents as any[]) {
        const geodeId = event.args?.geodeId;
        if (!geodeId) continue;
        
        // ✅ Obtener timestamp del bloque (cacheado)
        let timestamp: number;
        if (blockTimestampsCache.has(event.blockNumber)) {
          timestamp = blockTimestampsCache.get(event.blockNumber)!;
        } else {
          try {
            const block = await event.getBlock();
            timestamp = Number(block.timestamp);
            blockTimestampsCache.set(event.blockNumber, timestamp);
          } catch (error) {
            logger.warn(`No se pudo obtener timestamp del bloque ${event.blockNumber}`, { error });
            timestamp = Math.floor(Date.now() / 1000);
          }
        }
        
        geodeEventsMap.set(geodeId.toString(), {
          ...event,
          timestamp, // ✅ Agregar timestamp Unix correcto
        });
      }
      
      const geodeIds = Array.from(geodeEventsMap.keys()).map(id => BigInt(id));
      
      logger.info(`🔍 IDs de geodas extraídas: ${geodeIds.map(id => id.toString()).join(', ')}`);
      
      const geodesData = await this.loadGeodesInfo(
        geodeContract,
        forgeContract,
        geodeIds,
        userAddress,
        geodeEventsMap
      );

      logger.info(`✅ Cargadas ${geodesData.length} geodas activas`);
      
      return geodesData;
    } catch (error) {
      logger.error('Error cargando geodas del usuario', error);
      throw error;
    }
  }

  /**
   * Busca eventos GeodeForged en chunks para evitar límites de RPC
   */
  private async searchForgedEventsInChunks(
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    userAddress: Address,
    startBlock: number,
    currentBlock: number,
    chunkSize: number
  ): Promise<unknown[]> {
    let allEvents: unknown[] = [];

    for (let from = startBlock; from <= currentBlock; from += chunkSize + 1) {
      const to = Math.min(from + chunkSize, currentBlock);
      
      logger.debug(`Buscando chunk: bloques ${from} - ${to}`);
      
      const events = await withRetry(
        async () => {
          const ethersContract = (forgeContract as any).contract;
          return await ethersContract.queryFilter(
            ethersContract.filters.GeodeForged(userAddress),
            from,
            to
          );
        },
        {
          maxAttempts: 3,
          shouldRetry: isRetryableBlockchainError,
        }
      );

      if (events.length > 0) {
        logger.debug(`Encontrados ${events.length} eventos en chunk`);
        allEvents = allEvents.concat(events);
      }
    }

    return allEvents;
  }

  /**
   * Carga información completa de geodas
   * Filtra por ownership y estado
   */
  private async loadGeodesInfo(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFT>,
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    geodeIds: bigint[],
    userAddress: Address,
    geodeEventsMap: Map<string, any>
  ): Promise<GeodeInventoryInfo[]> {
    const geodesPromises = geodeIds.map(async (id) => {
      try {
        logger.debug(`🔍 Procesando geoda ID: ${id.toString()}`);
        
        // Verificar ownership (si falla, fue quemada)
        let owner: string;
        try {
          logger.debug(`🔍 Verificando owner de geoda ${id}`);
          owner = await geodeContract.ownerOf(id);
        } catch (ownerError) {
          const errorMessage = ownerError instanceof Error ? ownerError.message : '';
          logger.warn(`❌ Error verificando owner de geoda ${id}`, { errorMessage });
          if (
            errorMessage.includes('invalid token ID') ||
            errorMessage.includes('nonexistent token')
          ) {
            logger.debug(`Geoda ${id} fue quemada, omitiendo`);
            return null;
          }
          throw ownerError;
        }

        logger.debug(`👤 Owner de geoda ${id}: ${owner}, Usuario: ${userAddress}`);

        // Si no es el dueño, omitir
        if (owner.toLowerCase() !== userAddress.toLowerCase()) {
          logger.warn(`⚠️ Usuario no es owner de geoda ${id}, omitiendo`);
          return null;
        }

        // Obtener info de la geoda desde contrato
        const info = await geodeContract.getGeodeInfo(id);
        
        const category = Number(info.category) as GeodeCategory;
        const axieClass = Number(info.axieClass) as AxieClass;
        
        // ✅ Obtener forgeDate y creator desde el evento
        const event = geodeEventsMap.get(id.toString());
        const forgeDate = event?.timestamp || Math.floor(Date.now() / 1000); // ✅ Usar timestamp, no blockNumber
        const creator = event?.args?.user || userAddress;

        const categoryInfo = CATEGORY_INFO[category];
        const classInfo = AXIE_CLASS_INFO[axieClass];
        const fullName = getGeodeName(category, axieClass);

        // Calcular si puede eclosionar (1 minuto para pruebas)
        const hatchTime = forgeDate + 60;
        const now = Math.floor(Date.now() / 1000);
        const canHatch = now >= hatchTime;

        // Verificar si ya fue eclosionada
        const isHatched = await this.isGeodeHatched(forgeContract, id);

        // Calcular poder de minado según categoría (según whitepaper y Manual de Forja)
        const categoryPowerMap: Record<GeodeCategory, number> = {
          [GeodeCategory.PETIT]: 75,      // Corregido: 75 según Manual de Forja oficial
          [GeodeCategory.ALTO]: 125,
          [GeodeCategory.ANIMAL]: 165,
          [GeodeCategory.ULTRAMECH]: 165,
          [GeodeCategory.TANQUE]: 250
        };
        
        const miningPower = categoryPowerMap[category] || 75;
        const efficiency = 80; // Base efficiency para geodas
        
        logger.debug(`Geoda ${id} cargada - ${fullName} (Power: ${miningPower})`);

        return {
          id,
          category,
          axieClass,
          categoryName: categoryInfo.name,
          className: classInfo.displayName,
          fullName,
          owner: creator,
          createdAt: forgeDate,
          hatchTime,
          isHatched,
          canHatch,
          miningPower,
          efficiency,
          isStaked: false // TODO: Verificar estado de staking real
        };
      } catch (error) {
        logger.warn(`Error cargando geoda ${id}`, { error });
        return null;
      }
    });

    const allGeodes = await Promise.all(geodesPromises);
    return allGeodes.filter((geode) => geode !== null) as GeodeInventoryInfo[];
  }

  /**
   * Verifica si una geoda ya fue eclosionada
   */
  private async isGeodeHatched(
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    geodeId: bigint
  ): Promise<boolean> {
    try {
      // Verificar si hay eventos de eclosión para esta geoda
      // Nota: esto requiere acceso al contrato ethers subyacente
      const ethersContract = (forgeContract as any).contract;
      if (ethersContract && typeof ethersContract.queryFilter === 'function') {
        const filter = ethersContract.filters?.GeodeHatched?.(null, geodeId);
        if (filter) {
          const events = await ethersContract.queryFilter(filter);
          return events.length > 0;
        }
      }
      return false;
    } catch (error) {
      logger.warn('Error verificando si geoda fue eclosionada', { error });
      return false;
    }
  }
}
