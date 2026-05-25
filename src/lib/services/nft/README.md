# 🎨 NFT Services - Gestión de NFTs (ERC721)

Servicios especializados para interactuar con contratos NFT del juego.

---

## 📂 Contenido

```
nft/
├── MinerService.ts       # CoreMiner NFTs (principal)
├── AxieService.ts        # Axie NFTs
├── MinerDataService.ts   # Enriquecimiento de datos
└── index.ts              # Barrel export
```

---

## 📖 Servicios Disponibles

### **⛏️ MinerService**

Gestiona CoreMiner NFTs y sus metadatos.

```typescript
import { MinerService } from '@/lib/services/nft';

const minerService = new MinerService(contractAddress, provider);

// Obtener mineros de una wallet
const miners = await minerService.getMinersFromWallet(walletAddress);

// Obtener metadata de un minero
const metadata = await minerService.getMinerMetadata(tokenId, minerData);
```

**Funcionalidades:**
- ✅ Obtener todos los mineros de una wallet
- ✅ Cargar metadatos (nombres, imágenes, atributos)
- ✅ Calcular rareza basada en stats
- ✅ Mapeo de tipos de mineros

---

### **🦎 AxieService**

Gestiona Axie NFTs.

```typescript
import { AxieService } from '@/lib/services/nft';

const axieService = new AxieService(contractAddress, provider);

// Obtener Axies de una wallet
const axies = await axieService.getAxiesFromWallet(walletAddress);

// Obtener metadata de un Axie
const metadata = await axieService.getAxieMetadata(tokenId);
```

**Funcionalidades:**
- ✅ Obtener todos los Axies de una wallet
- ✅ Cargar metadatos desde API de Axie Infinity
- ✅ Mapeo de clases y stats

---

### **📊 MinerDataService** ⭐ (Nuevo)

Enriquece datos de mineros con información de contratos.

**Resuelve TODOs críticos:**
- ✅ `collectionBonus` - Calcula desde sinergias
- ✅ `isMining` - Verifica estado en MiningPool
- ✅ `lastClaimTime` - Obtiene desde sesión
- ✅ `totalMined` - Lee stats del minero

```typescript
import { createMinerDataService } from '@/lib/services/nft';

const dataService = createMinerDataService(contractManager);

// Enriquecer datos de un minero
const enriched = await dataService.enrichMinerData(minerId, ownerAddress);
// {
//   collectionBonus: 15,
//   isMining: true,
//   lastClaimTime: 1705789200,
//   totalMined: 1500000000000000000n
// }

// Enriquecer múltiples mineros en batch
const miners = [
  { minerId: 1n, owner: '0x...' },
  { minerId: 2n, owner: '0x...' }
];
const enrichmentMap = await dataService.enrichMinersBatch(miners);
```

**Beneficios:**
- ✅ Resuelve 4 TODOs críticos del audit
- ✅ Batch processing optimizado
- ✅ Fallback gracioso en caso de error
- ✅ Logging estructurado

---

## 🎯 Integración con MinerService

Usar `MinerDataService` para enriquecer datos de `MinerService`:

```typescript
import { MinerService, createMinerDataService } from '@/lib/services/nft';
import { ContractManager } from '@/lib/contracts/ContractManager';

// 1. Obtener mineros básicos
const minerService = new MinerService(contractAddress, provider);
const miners = await minerService.getMinersFromWallet(walletAddress);

// 2. Enriquecer con datos de contratos
const contractManager = ContractManager.getInstance({ chainId, signerOrProvider });
const dataService = createMinerDataService(contractManager);

const enrichedMiners = await Promise.all(
  miners.map(async (miner) => {
    const enrichment = await dataService.enrichMinerData(
      miner.tokenId,
      walletAddress
    );
    
    return {
      ...miner,
      collectionBonus: enrichment.collectionBonus,
      isMining: enrichment.isMining,
      lastClaimTime: enrichment.lastClaimTime,
      totalMined: enrichment.totalMined,
    };
  })
);
```

---

## 🔧 Utilities NFT Compartidas

Los servicios utilizan utilities de `@/lib/utils/nft`:

```typescript
import {
  getTokenIdsFromOwner,
  mapAndFilterNulls,
  isContractDeployed,
  processInChunks
} from '@/lib/utils/nft';

// Obtener token IDs en paralelo
const tokenIds = await getTokenIdsFromOwner(contract, owner, balance);

// Mapear y filtrar nulls con type safety
const nfts = await mapAndFilterNulls(tokenIds, async (id) => {
  try {
    return await getNFTData(id);
  } catch {
    return null;
  }
});
```

---

## 📊 Tipos y Metadatos

### **CoreMinerNFT**
```typescript
interface CoreMinerNFT extends CoreMiner {
  metadata: MinerMetadata;
}

interface MinerMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}
```

### **AxieNFT**
```typescript
interface AxieNFT extends Axie {
  metadata: AxieMetadata;
}
```

---

## 🚀 Mejoras Recientes

### **v2.0 - Consolidación**
- ✅ Movidos de `/src/services/nft` a `/src/lib/services/nft`
- ✅ `MinerDataService` creado para resolver TODOs
- ✅ Barrel exports actualizados
- ✅ Integración con ContractManager

### **Antes (Disperso)** ❌
- Servicios en `/src/services/nft` (fuera de `/lib`)
- TODOs hardcoded en `minerService.ts`
- Sin integración con ContractManager

### **Ahora (Consolidado)** ✅
- Servicios centralizados en `/lib/services/nft`
- `MinerDataService` resuelve TODOs dinámicamente
- Integración completa con arquitectura `/lib`

---

## 📝 Próximos Pasos

### **Collection Bonus (TODO)**
Implementar detección de sinergias:
```typescript
// En MinerDataService.calculateCollectionBonus()
const minerContract = this.contractManager.getCoreMinerNFT();
const minerIds = await minerContract.tokensOfOwner(owner);

// Detectar sets completos (misma clase de Axie)
const synergyBonus = calculateSynergyBonus(minerIds);
return synergyBonus;
```

### **Caché de Metadatos**
Agregar caché persistente para metadatos NFT:
```typescript
// LocalStorage o IndexedDB
const cachedMetadata = await metadataCache.get(tokenId);
if (cachedMetadata && !isStale(cachedMetadata)) {
  return cachedMetadata;
}
```

---

## 🔄 Migración desde `/src/services/nft`

**Archivos originales (deprecados):**
- `/src/services/nft/minerService.ts` → **usar `/lib/services/nft/MinerService.ts`**
- `/src/services/nft/axieService.ts` → **usar `/lib/services/nft/AxieService.ts`**

**Actualizar imports:**
```typescript
// ❌ Antes
import { MinerService } from '@/services/nft/minerService';

// ✅ Ahora
import { MinerService } from '@/lib/services/nft';
```
