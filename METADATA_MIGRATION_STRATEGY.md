# Estrategia de Migración: Metadata Estática Local → Arquitectura Híbrida en Producción

**Autor:** Sistema ScorchCore  
**Fecha:** Enero 2026  
**Versión:** 1.0  
**Estado:** Planificación

---

## 📋 Tabla de Contenidos

1. [Contexto y Problema Actual](#contexto-y-problema-actual)
2. [Arquitectura Propuesta](#arquitectura-propuesta)
3. [Separación de Datos](#separación-de-datos)
4. [Plan de Migración por Fases](#plan-de-migración-por-fases)
5. [Implementación Técnica](#implementación-técnica)
6. [Estrategia de Cache](#estrategia-de-cache)
7. [Consideraciones de Producción](#consideraciones-de-producción)
8. [Checklist de Migración](#checklist-de-migración)

---

## 🎯 Contexto y Problema Actual

### Estado Actual (Testnet)

```
Frontend → Metadata JSON Local (/public/metadata/)
         → Videos locales (/public/assets/videos/coreminers/)
```

**Problemas identificados:**

- ✅ **Funciona para desarrollo/testnet**
- ❌ **No escala para producción** (metadata local de 7,000+ NFTs)
- ❌ **Datos estáticos** (no soporta level-up, repairs, degradación)
- ❌ **No refleja estado on-chain** (efficiency, durability, staking)
- ❌ **Bundle size excesivo** si se incluye toda la metadata

### Requisitos para Producción

1. **Metadata base inmutable** → IPFS (descentralizado)
2. **Stats dinámicos** → Smart Contracts + API (tiempo real)
3. **Assets pesados** → CDN + IPFS (performance)
4. **Cache inteligente** → Múltiples capas (reducir costos)
5. **Compatibilidad ERC-721** → `tokenURI()` estándar

---

## 🏗️ Arquitectura Propuesta

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                          │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ Static Metadata  │  │  Dynamic Data    │  │  Asset Cache   │ │
│  │   (IPFS CDN)     │  │   (API Layer)    │  │   (Pinata)     │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           ↓                     ↓                     ↓          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Unified Miner Data Service                     │   │
│  │  - Combina metadata estática + datos dinámicos           │   │
│  │  - Calcula poder actual, estado, recompensas             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┬──────────────────────┬──────────────────────────┐
│   IPFS       │   Smart Contracts    │     Backend API          │
│              │                      │                          │
│ - Metadata   │ - MinerStatsManager  │ - /api/metadata/dynamic/ │
│ - Videos     │ - CoreMinerNFT       │ - Cache Redis            │
│ - Images     │ - StakingManager     │ - Aggregate queries      │
│ - Inmutable  │ - Ownership          │ - Real-time updates      │
└──────────────┴──────────────────────┴──────────────────────────┘
```

---

## 📊 Separación de Datos

### Datos ESTÁTICOS (Inmutables) → IPFS

**Ubicación:** `ipfs://<CID>/metadata/<category>/coreminer-<category>-<type>-<index>.json`

**Contenido:**
```json
{
  "name": "Chorro Preciso",
  "description": "A AQUA-type CoreMiner from the ScorchCore mining ecosystem...",
  "description_localized": {
    "en": "...",
    "es": "..."
  },
  "image": "ipfs://bafybei.../PETIT/PETIT_AQUA/CHORRO_PRECISO.mp4",
  "animation_url": "ipfs://bafybei.../PETIT/PETIT_AQUA/CHORRO_PRECISO.mp4",
  "external_url": "https://scorchcore.xyz/miner/{id}",
  "attributes": [
    {
      "trait_type": "Miner Name",
      "value": "Chorro Preciso"
    },
    {
      "trait_type": "Type",
      "value": "AQUA"
    },
    {
      "trait_type": "Stage",
      "value": "PETIT"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    },
    {
      "trait_type": "Base Mining Power",
      "value": 80
    },
    {
      "trait_type": "Max Supply",
      "value": 1800
    },
    {
      "trait_type": "Origin Recipe",
      "value": "Chorro Preciso"
    },
    {
      "trait_type": "Recipe Serial Number",
      "value": 2
    }
  ],
  "_dynamic_data_source": {
    "contract": "MinerStatsManager",
    "api_endpoint": "/api/metadata/dynamic/{tokenId}",
    "fields": [
      "level",
      "experience",
      "efficiency",
      "durability",
      "currentPower",
      "lastMined",
      "lastRepaired"
    ],
    "notes": "Current power = basePower * (efficiency/100) * levelMultiplier"
  }
}
```

**Características:**
- ✅ Nunca cambian después del mint
- ✅ Cacheables indefinidamente
- ✅ Descentralizados (IPFS)
- ✅ Compatibles con OpenSea/marketplaces

### Datos DINÁMICOS (Mutables) → Smart Contract + API

**Fuente primaria:** Smart Contract `MinerStatsManager.sol`

```solidity
struct MinerStats {
    uint8 level;              // Incrementa con experience
    uint256 experience;       // Acumulada en mining
    uint8 efficiency;         // 0-100, baja con uso
    uint8 durability;         // 0-100, se degrada
    uint256 lastMined;        // Timestamp última vez minado
    uint256 lastRepaired;     // Timestamp última reparación
    bool isVoracious;         // Estado especial (requiere feeding)
    uint256 lastFed;          // Si es voraz, cuándo fue alimentado
}
```

**API Endpoint:** `/api/metadata/dynamic/[tokenId]`

**Response:**
```json
{
  "tokenId": "42",
  "level": 3,
  "experience": 1500,
  "efficiency": 87,
  "durability": 65,
  "currentPower": 89,
  "basePower": 80,
  "powerModifiers": {
    "level": 1.15,
    "efficiency": 0.87,
    "collection": 1.05
  },
  "staking": {
    "isStaked": true,
    "stakingPool": "0x...",
    "stakedSince": 1706400000,
    "miningCycles": 12,
    "pendingRewards": "450000000000000000"
  },
  "maintenance": {
    "lastMined": 1706486400,
    "lastRepaired": 1706400000,
    "repairCostPercentage": 6,
    "isVoracious": false,
    "lastFed": null
  },
  "metadata": {
    "lastUpdated": 1706490000,
    "cacheUntil": 1706490060
  }
}
```

**Cálculo de Poder Actual:**
```typescript
currentPower = basePower 
  * (efficiency / 100) 
  * levelMultiplier 
  * collectionBonus
```

---

## 🚀 Plan de Migración por Fases

### **Fase 0: Preparación** (Actual - Testnet)
**Estado:** ✅ Completado  
**Duración:** N/A

- [x] Metadata local en `/public/metadata/` para desarrollo
- [x] Videos locales en `/public/assets/videos/coreminers/`
- [x] `LocalMetadataService` para cargar metadata local
- [x] Sistema funcional en testnet

### **Fase 1: Infraestructura Backend** (Pre-producción)
**Estado:** ⏳ Pendiente  
**Duración:** 1-2 semanas

**Tareas:**

1. **Crear API de Metadata Dinámica**
   ```
   /api/metadata/dynamic/[tokenId].ts
   /api/metadata/batch.ts (carga múltiple)
   ```

2. **Implementar Cache Layer**
   - Redis para cache de stats (TTL: 60s)
   - CDN cache para metadata estática (TTL: 1 año)

3. **Servicios de Cálculo**
   ```typescript
   // services/MinerStatsCalculator.ts
   - calculateCurrentPower()
   - getLevelMultiplier()
   - getRepairCost()
   - getPendingRewards()
   ```

4. **Testing**
   - Unit tests para cálculos
   - Integration tests con contratos testnet
   - Load testing (1000+ requests/s)

**Entregables:**
- API funcionando en testnet
- Documentación de endpoints
- Tests pasando

### **Fase 2: Migración IPFS** (Pre-producción)
**Estado:** ⏳ Pendiente  
**Duración:** 1 semana

**Tareas:**

1. **Subir Metadata a IPFS**
   ```bash
   # Script de migración
   node scripts/upload-metadata-to-ipfs.js
   ```
   - Estructura: `CID/metadata/<category>/coreminer-<category>-<type>-<index>.json`
   - Verificar integridad (checksums)
   - Pin en Pinata + backup gateway

2. **Subir Assets a IPFS**
   - Videos por categoría (usar CIDs por categoría)
   - Thumbnails/posters
   - Pin permanente

3. **Actualizar Contratos**
   ```solidity
   // Actualizar baseURI en CoreMinerNFT
   function setBaseURI(string memory newBaseURI) external onlyOwner {
       baseURI = "ipfs://<CID>/metadata/";
   }
   ```

4. **Verificación**
   - Probar `tokenURI(tokenId)` en cada categoría
   - Verificar OpenSea puede leer metadata
   - Gateway fallbacks funcionando

**Entregables:**
- Metadata en IPFS con CIDs documentados
- Contratos actualizados
- Verificación en marketplaces

### **Fase 3: Frontend Híbrido** (Pre-producción)
**Estado:** ⏳ Pendiente  
**Duración:** 1 semana

**Tareas:**

1. **Crear Service Unificado**
   ```typescript
   // services/HybridMinerDataService.ts
   export async function getMinerData(tokenId: bigint): Promise<CoreMinerNFT> {
     // 1. Fetch static metadata (IPFS)
     const staticData = await fetchIPFSMetadata(tokenId);
     
     // 2. Fetch dynamic data (API)
     const dynamicData = await fetchDynamicData(tokenId);
     
     // 3. Combine
     return combineData(staticData, dynamicData);
   }
   ```

2. **Actualizar Facades**
   - `NFTFacade` usa nuevo servicio híbrido
   - `InventoryFacade` batch loading
   - Mantener fallback a local en dev

3. **React Query Integration**
   ```typescript
   const { data: miner } = useQuery({
     queryKey: ['miner', tokenId],
     queryFn: () => getMinerData(tokenId),
     staleTime: 60000,  // 1 min
     cacheTime: 300000  // 5 min
   });
   ```

4. **Testing E2E**
   - Inventory loading
   - Staking dashboard
   - Miner detail pages
   - Performance metrics

**Entregables:**
- Frontend usando datos híbridos
- Tests E2E pasando
- Performance benchmarks

### **Fase 4: Optimización y Monitoreo** (Producción)
**Estado:** ⏳ Pendiente  
**Duración:** Ongoing

**Tareas:**

1. **Monitoreo**
   - Logs de API (success rate, latency)
   - Cache hit rates (Redis, CDN)
   - IPFS gateway health
   - Contract call costs

2. **Optimizaciones**
   - Batch queries para múltiples miners
   - Prefetching en inventario
   - Service Worker para offline
   - WebSocket para updates real-time (opcional)

3. **Documentación**
   - Guía de troubleshooting
   - Runbook de incidentes
   - Performance baselines

**Entregables:**
- Dashboard de monitoreo
- Alertas configuradas
- Documentación completa

---

## 💻 Implementación Técnica

### 1. API: Metadata Dinámica

**Archivo:** `app/api/metadata/dynamic/[tokenId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { ronin } from 'viem/chains';
import { redis } from '@/lib/redis';
import { createServiceLogger } from '@/lib/utils/logger';

const logger = createServiceLogger('DynamicMetadataAPI');

const CACHE_TTL = 60; // 60 segundos

export async function GET(
  req: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const { tokenId } = params;
  const tokenIdBigInt = BigInt(tokenId);

  try {
    // 1. Check cache
    const cached = await redis.get(`miner:dynamic:${tokenId}`);
    if (cached) {
      logger.debug('Cache hit', { tokenId });
      return NextResponse.json(JSON.parse(cached));
    }

    // 2. Fetch from contract
    const client = createPublicClient({
      chain: ronin,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const [minerStats, stakingInfo, minerData] = await Promise.all([
      client.readContract({
        address: process.env.NEXT_PUBLIC_MINER_STATS_MANAGER as `0x${string}`,
        abi: MinerStatsManagerABI,
        functionName: 'getMinerStats',
        args: [tokenIdBigInt]
      }),
      client.readContract({
        address: process.env.NEXT_PUBLIC_STAKING_MANAGER as `0x${string}`,
        abi: StakingManagerABI,
        functionName: 'getStakingInfo',
        args: [tokenIdBigInt]
      }),
      client.readContract({
        address: process.env.NEXT_PUBLIC_COREMINER_NFT as `0x${string}`,
        abi: CoreMinerNFTABI,
        functionName: 'getMinerData',
        args: [tokenIdBigInt]
      })
    ]);

    // 3. Calculate derived values
    const basePower = Number(minerData[3]); // power from contract
    const efficiency = Number(minerStats.efficiency);
    const level = Number(minerStats.level);
    
    const levelMultiplier = 1 + (level * 0.05); // +5% por nivel
    const currentPower = Math.floor(
      basePower * (efficiency / 100) * levelMultiplier
    );

    // 4. Build response
    const response = {
      tokenId,
      level,
      experience: minerStats.experience.toString(),
      efficiency,
      durability: Number(minerStats.durability),
      currentPower,
      basePower,
      powerModifiers: {
        level: levelMultiplier,
        efficiency: efficiency / 100,
        collection: 1.0 // TODO: Implement collection bonus
      },
      staking: {
        isStaked: stakingInfo.isActive,
        stakingPool: stakingInfo.poolAddress,
        stakedSince: Number(stakingInfo.startTime),
        miningCycles: Number(stakingInfo.cycles),
        pendingRewards: stakingInfo.pendingRewards.toString()
      },
      maintenance: {
        lastMined: Number(minerStats.lastMined),
        lastRepaired: Number(minerStats.lastRepaired),
        repairCostPercentage: 6, // TODO: Get from contract
        isVoracious: minerStats.isVoracious,
        lastFed: minerStats.isVoracious ? Number(minerStats.lastFed) : null
      },
      metadata: {
        lastUpdated: Date.now(),
        cacheUntil: Date.now() + (CACHE_TTL * 1000)
      }
    };

    // 5. Cache response
    await redis.setex(
      `miner:dynamic:${tokenId}`,
      CACHE_TTL,
      JSON.stringify(response)
    );

    logger.info('Dynamic metadata generated', { tokenId, currentPower });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error fetching dynamic metadata', { tokenId, error });
    
    return NextResponse.json(
      { error: 'Failed to fetch dynamic metadata' },
      { status: 500 }
    );
  }
}
```

### 2. Frontend: Servicio Híbrido

**Archivo:** `lib/services/HybridMinerDataService.ts`

```typescript
import { createServiceLogger } from '@/lib/utils/logger';
import type { CoreMinerNFT } from '@/lib/facades/NFTFacade';
import type { Address } from 'viem';

const logger = createServiceLogger('HybridMinerDataService');

interface StaticMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface DynamicData {
  tokenId: string;
  level: number;
  experience: string;
  efficiency: number;
  durability: number;
  currentPower: number;
  basePower: number;
  staking: {
    isStaked: boolean;
    pendingRewards: string;
  };
}

/**
 * Obtiene metadata estática desde IPFS
 */
async function fetchStaticMetadata(
  tokenId: bigint
): Promise<StaticMetadata> {
  // En producción, usar tokenURI() del contrato
  const tokenURI = await getTokenURI(tokenId);
  
  // Intentar múltiples gateways
  const gateways = [
    'https://peach-tiny-crawdad-788.mypinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'
  ];
  
  const ipfsPath = tokenURI.replace('ipfs://', '');
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}${ipfsPath}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 31536000 } // Cache 1 año
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      logger.warn('IPFS gateway failed', { gateway, error });
      continue;
    }
  }
  
  throw new Error(`Failed to fetch metadata for token ${tokenId}`);
}

/**
 * Obtiene datos dinámicos desde API
 */
async function fetchDynamicData(
  tokenId: bigint
): Promise<DynamicData> {
  const response = await fetch(`/api/metadata/dynamic/${tokenId}`, {
    next: { revalidate: 60 } // Cache 60 segundos
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dynamic data for token ${tokenId}`);
  }
  
  return await response.json();
}

/**
 * Combina metadata estática y dinámica
 */
export async function getMinerData(
  tokenId: bigint,
  owner: Address
): Promise<CoreMinerNFT> {
  logger.debug('Fetching hybrid miner data', { tokenId: tokenId.toString() });
  
  // Fetch en paralelo
  const [staticData, dynamicData] = await Promise.all([
    fetchStaticMetadata(tokenId),
    fetchDynamicData(tokenId)
  ]);
  
  // Extraer atributos estáticos
  const getAttribute = (traitType: string) => {
    return staticData.attributes.find(
      attr => attr.trait_type === traitType
    )?.value;
  };
  
  const category = mapCategoryFromName(getAttribute('Stage') as string);
  const minerType = mapTypeFromName(getAttribute('Type') as string);
  
  // Combinar datos
  const minerData: CoreMinerNFT = {
    tokenId,
    name: staticData.name,
    
    // Metadata estática (IPFS)
    category,
    minerType,
    minerIndex: 0, // TODO: Extraer de metadata
    videoUrl: staticData.animation_url,
    rarity: getAttribute('Rarity') as string,
    maxSupply: getAttribute('Max Supply') as number,
    
    // Stats dinámicos (API/Contract)
    miningPower: dynamicData.currentPower,
    basePower: dynamicData.basePower,
    efficiency: dynamicData.efficiency,
    level: dynamicData.level,
    experience: BigInt(dynamicData.experience),
    durability: dynamicData.durability,
    
    // Estado
    owner,
    isMining: dynamicData.staking.isStaked,
    isStaked: dynamicData.staking.isStaked,
    
    // Metadata completa
    metadata: {
      name: staticData.name,
      description: staticData.description,
      image: staticData.image,
      animation_url: staticData.animation_url,
      attributes: staticData.attributes
    }
  };
  
  logger.info('Hybrid miner data loaded', {
    tokenId: tokenId.toString(),
    name: minerData.name,
    currentPower: minerData.miningPower,
    level: minerData.level
  });
  
  return minerData;
}

/**
 * Carga múltiples miners en batch
 */
export async function getBatchMinerData(
  tokenIds: bigint[],
  owner: Address
): Promise<CoreMinerNFT[]> {
  // TODO: Implementar endpoint /api/metadata/batch
  // Por ahora, cargar en paralelo con limit
  const BATCH_SIZE = 10;
  const results: CoreMinerNFT[] = [];
  
  for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
    const batch = tokenIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(tokenId => getMinerData(tokenId, owner))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### 3. React Query Integration

**Archivo:** `hooks/useMinerData.ts`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMinerData } from '@/lib/services/HybridMinerDataService';
import type { Address } from 'viem';

export function useMinerData(tokenId: bigint, owner: Address) {
  return useQuery({
    queryKey: ['miner', tokenId.toString()],
    queryFn: () => getMinerData(tokenId, owner),
    staleTime: 60000,      // Considerar stale después de 1 minuto
    cacheTime: 300000,     // Mantener en cache 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export function useInvalidateMinerData() {
  const queryClient = useQueryClient();
  
  return (tokenId: bigint) => {
    queryClient.invalidateQueries({
      queryKey: ['miner', tokenId.toString()]
    });
  };
}
```

**Uso en componentes:**

```typescript
function CoreMinerCard({ tokenId, owner }: { tokenId: bigint, owner: Address }) {
  const { data: miner, isLoading, error } = useMinerData(tokenId, owner);
  const invalidate = useInvalidateMinerData();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!miner) return null;
  
  return (
    <Card>
      <video src={miner.videoUrl} />
      <h3>{miner.name}</h3>
      <div>⚡ Power: {miner.miningPower}</div>
      <div>📊 Efficiency: {miner.efficiency}%</div>
      <div>🎯 Level: {miner.level}</div>
      
      <button onClick={() => invalidate(tokenId)}>
        Refresh Stats
      </button>
    </Card>
  );
}
```

---

## 🗄️ Estrategia de Cache

### Cache en Múltiples Capas

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Browser Cache (React Query)            │
│ - TTL: 1-5 minutos                              │
│ - Invalidación: Manual o por evento             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 2: CDN/Edge (Vercel/Cloudflare)          │
│ - TTL: Variable (60s dinámicos, 1 año estáticos)│
│ - Headers: Cache-Control, ETag                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 3: Redis (Backend)                       │
│ - TTL: 60 segundos                              │
│ - Key: miner:dynamic:{tokenId}                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Layer 4: IPFS (Metadata Estática)              │
│ - TTL: Inmutable (no expira)                    │
│ - Pin: Pinata + backup gateways                 │
└─────────────────────────────────────────────────┘
```

### Headers de Cache

**Metadata Estática (IPFS):**
```http
Cache-Control: public, max-age=31536000, immutable
```

**API Dinámica:**
```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

**Assets (Videos, Imágenes):**
```http
Cache-Control: public, max-age=31536000, immutable
```

---

## 🔐 Consideraciones de Producción

### Seguridad

- **Rate Limiting:** 100 requests/min por IP en API
- **API Keys:** No exponer en frontend
- **CORS:** Configurar origins permitidos
- **Input Validation:** Sanitizar tokenId

### Performance

- **Objetivo:** < 200ms p95 latency en API
- **Batch Loading:** Inventario carga 50 miners en < 2s
- **CDN:** 99% cache hit rate en assets estáticos
- **IPFS:** Fallback a 3+ gateways

### Monitoring

**Métricas clave:**
- API latency (p50, p95, p99)
- Cache hit rates (Redis, CDN, Browser)
- IPFS gateway health
- Contract call costs (gas)
- Error rates por endpoint

**Alertas:**
- API latency > 500ms
- Cache hit rate < 90%
- Error rate > 5%
- IPFS gateway down

### Costos

**Estimación mensual (10k usuarios activos):**

| Servicio | Costo Estimado |
|----------|----------------|
| Pinata (IPFS pinning) | $20-50 |
| Redis Cloud (cache) | $10-30 |
| RPC calls (contract reads) | $50-100 |
| CDN (Vercel/CF) | Incluido |
| **Total** | **~$100/mes** |

---

## ✅ Checklist de Migración

### Pre-Migración
- [ ] Backup completo de metadata local
- [ ] Testing exhaustivo en testnet
- [ ] Documentación actualizada
- [ ] Runbook de rollback preparado

### Fase 1: Backend
- [ ] API `/api/metadata/dynamic/` funcionando
- [ ] Redis configurado y testeado
- [ ] Unit tests pasando (>80% coverage)
- [ ] Load testing completado

### Fase 2: IPFS
- [ ] Metadata subida a IPFS
- [ ] CIDs documentados por categoría
- [ ] Pin permanente en Pinata
- [ ] Contratos actualizados con nuevos baseURIs
- [ ] Verificación en OpenSea/Blur

### Fase 3: Frontend
- [ ] `HybridMinerDataService` implementado
- [ ] React Query configurado
- [ ] Facades actualizados
- [ ] E2E tests pasando
- [ ] Performance benchmarks OK

### Post-Migración
- [ ] Monitoring dashboard activo
- [ ] Alertas configuradas
- [ ] Logs agregándose correctamente
- [ ] Documentación de troubleshooting lista
- [ ] Metadata local deprecada pero mantenida como fallback

---

## 📚 Referencias

### Contratos Relevantes
- `CoreMinerNFT.sol` - Token principal, `tokenURI()`
- `MinerStatsManager.sol` - Stats dinámicos
- `StakingManager.sol` - Estado de staking
- `MetadataProvider.sol` - (Opcional) On-chain metadata builder

### Estándares
- [ERC-721 Metadata Extension](https://eips.ethereum.org/EIPS/eip-721)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [IPFS Best Practices](https://docs.ipfs.tech/concepts/best-practices/)

### Herramientas
- [Pinata](https://www.pinata.cloud/) - IPFS pinning service
- [React Query](https://tanstack.com/query/latest) - Data fetching & caching
- [Vercel](https://vercel.com/) - Edge Functions & CDN
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/) - Cache layer

---

## 🔄 Versionado

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Enero 2026 | Documento inicial |

---

**Próximos Pasos:**
1. Revisar y aprobar este documento
2. Iniciar Fase 1: Implementar API de metadata dinámica
3. Configurar Redis para cache
4. Testing exhaustivo en testnet

**Contacto:**  
Para preguntas o sugerencias sobre esta migración, contactar al equipo de desarrollo.
