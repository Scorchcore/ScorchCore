# 🔌 Contracts - Gestión de Contratos Inteligentes

ContractManager (Singleton) y factories para instanciar y gestionar contratos.

---

## 📂 Estructura

```
contracts/
├── ContractManager.ts          # Singleton para gestión centralizada
├── factories/                  # Factories por contrato
│   ├── BaseContractFactory.ts
│   ├── ForgeContractFactory.ts
│   ├── MiningPoolFactory.ts
│   ├── ERC20Factory.ts
│   └── ...
├── interfaces/                 # Interfaces de contratos
│   ├── IForgeContract.ts
│   ├── IMiningContract.ts
│   └── ...
└── types/                      # Tipos compartidos
    └── index.ts
```

---

## 🎯 Arquitectura

### **Patrón Singleton + Factory**

```
┌─────────────────────────────────────────┐
│      ContractManager (Singleton)        │
│  - Única instancia                      │
│  - Cache de contratos                   │
│  - Provider/Signer management           │
└─────────────┬───────────────────────────┘
              │ usa
┌─────────────▼───────────────────────────┐
│         CONTRACT FACTORIES              │
│  - ForgeContractFactory                 │
│  - MiningPoolFactory                    │
│  - ERC20Factory                         │
└─────────────┬───────────────────────────┘
              │ retorna
┌─────────────▼───────────────────────────┐
│      CONTRACT INTERFACES                │
│  - IForgeContract                       │
│  - IMiningContract                      │
│  - IERC20Contract                       │
└─────────────────────────────────────────┘
```

---

## 📖 ContractManager

### **Singleton Pattern**
```typescript
import { ContractManager } from '@/lib/contracts/ContractManager';

// Obtener instancia única
const contractManager = ContractManager.getInstance({
  provider: yourProvider,
  signer: yourSigner,
  chainId: 2021
});

// Acceder a contratos
const miningPool = contractManager.getMiningPool();
const forgeFactory = contractManager.getForgeFactory();
const minerNFT = contractManager.getCoreMinerNFT();
```

### **Características**
- ✅ **Única instancia** - Evita múltiples instancias
- ✅ **Caché de contratos** - Reutiliza instancias
- ✅ **Provider/Signer management** - Centralizado
- ✅ **Multi-chain support** - Cambia addresses por red

---

## 🏭 Contract Factories

### **Factories Implementadas (15 Total)**

| Factory | Interface | Status | Fase |
|---------|-----------|--------|------|
| `ForgeContractFactory` | IForgeContract | ✅ | Core |
| `MiningPoolFactory` | IMiningContract | ✅ | Core |
| `ERC20Factory` | IERC20Contract | ✅ | Core |
| `MinerStatsManagerFactory` | IMinerStatsManager | ✅ | Fase 11 |
| `RecipeRegistryFactory` | IRecipeRegistry | ✅ | Fase 12 |
| `PriceOracleFactory` | IPriceOracle | ✅ | Fase 13 |
| `CollectionTrackerFactory` | ICollectionTracker | ✅ | Fase 14 |
| `SetRegistryFactory` | ISetRegistry | ✅ | Fase 14 |
| `BuyBackFundFactory` | IBuyBackFund | ✅ | Fase 6 |
| `VestingManagerFactory` | IVestingManager | ✅ | Fase 10 |
| `EmissionScheduleFactory` | IEmissionSchedule | ✅ | Fase 10 |
| `TrustScoreManagerFactory` | ITrustScoreContract | ✅ | Fase 4 |
| `RoyaltyManagerFactory` | IRoyaltyContract | ✅ | Fase 5 |
| `CycleManagerFactory` | ICycleManager | ✅ | Fase 2 |
| `AxieStakingManagerFactory` | IAxieStakingManager | ✅ | Fase 1 |

### **Patrón Estándar de Factory**
```typescript
// MinerStatsManagerFactory.ts
export class MinerStatsManagerFactory {
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): IMinerStatsManager {
    logger.info('Creating MinerStatsManager instance', { address, chainId });
    
    const contract = new ethers.Contract(
      address,
      MINERSTATSMANAGER_ABI,
      providerOrSigner
    );
    
    return new MinerStatsManagerContract(address, chainId, contract);
  }
}
```

### **Beneficios del Factory Pattern**
1. **Encapsulación** - Lógica de creación centralizada
2. **Type Safety** - Retorna interfaz tipada
3. **Testeable** - Fácil mock del factory
4. **Reutilizable** - Mismo código para crear contratos
5. **Logging Integrado** - Cada factory tiene logging estructurado

---

## 🔌 Contract Interfaces

### **Interfaces Implementadas (18 Total)**

#### **Core System**
- `IForgeContract` - Sistema de forja de geodas
- `IMiningContract` - Pool de minería de CORE
- `IERC20Contract` - Tokens ERC20 genéricos
- `IMinerStatsManager` - ✨ **Nuevo** - Estadísticas de miners (Fase 11)

#### **NFTs**
- `ICoreMinerNFT` - NFTs de miners
- `IGeodeNFT` - NFTs de geodas
- `IAxieContract` - Integración Axie Infinity

#### **Economía Avanzada**
- `IFCoreToken` - Token fCORE
- `IFCoreConverter` - Conversión fCORE → CORE
- `IPriceOracle` - ✨ **Nuevo** - Oracle de precios (Fase 13)
- `IBuyBackFund` - Fondo de recompra
- `IVestingManager` - Gestión de vesting
- `IEmissionSchedule` - Schedule de emisión
- `ITrustScoreContract` - Sistema de trust score
- `IRoyaltyContract` - Gestión de royalties

#### **Features Avanzadas**
- `IRecipeRegistry` - ✨ **Nuevo** - Registro de recetas (Fase 12)
- `ICollectionTracker` - ✨ **Nuevo** - Tracking de colecciones (Fase 14)
- `ISetRegistry` - ✨ **Nuevo** - Registro de sets (Fase 14)
- `ICycleManager` - Sistema de ciclos
- `IAxieStakingManager` - Staking de Axies

### **Ejemplo de Interface**
```typescript
// interfaces/IMinerStatsManager.ts
export interface IMinerStatsManager {
  // Lectura
  getStats(minerId: bigint): Promise<MinerStats>;
  getEffectivePower(minerId: bigint): Promise<bigint>;
  
  // Escritura
  updateStats(minerId: bigint, rewards: bigint): Promise<TransactionResult>;
  
  // Eventos
  on(eventName: string, callback: EventCallback): () => void;
}
```

### **Ventajas de Interfaces**
- ✅ **Contrato explícito** - Métodos esperados claramente definidos
- ✅ **Mock fácil** - Implementar interfaz en tests
- ✅ **LSP compliance** - Factories intercambiables
- ✅ **Documentación** - Interface = API documentation
- ✅ **Type Safety** - TypeScript strict mode con 0 errores

---

## 🎯 Uso

### **En Services**
```typescript
import { ContractManager } from '@/lib/contracts/ContractManager';

export class MiningService {
  constructor(private contractManager: ContractManager) {}
  
  async startMining(minerId: bigint): Promise<void> {
    const miningPool = this.contractManager.getMiningPool();
    await miningPool.startMining(minerId);
  }
}
```

### **En Facades**
```typescript
import { ContractManager } from '@/lib/contracts/ContractManager';

export class NFTFacade {
  constructor(private contractManager: ContractManager) {}
  
  async getMinersFromWallet(address: Address) {
    const minerContract = this.contractManager.getCoreMinerNFT();
    const balance = await minerContract.balanceOf(address);
    // ...
  }
}
```

### **En Hooks**
```typescript
import { useContractManager } from '@/lib/hooks';

function MyComponent() {
  const contractManager = useContractManager();
  
  useEffect(() => {
    const miningPool = contractManager.getMiningPool();
    // Usar contrato...
  }, [contractManager]);
}
```

---

## 🔄 Lifecycle

### **Inicialización**
```typescript
// 1. Crear config
const config = {
  provider: await connector.getProvider(),
  signer: await connector.getSigner(),
  chainId: chain.id
};

// 2. Obtener instancia
const contractManager = ContractManager.getInstance(config);

// 3. Usar contratos
const miningPool = contractManager.getMiningPool();
```

### **Cambio de Red**
```typescript
// ContractManager detecta cambio y actualiza addresses
const contractManager = ContractManager.getInstance({
  chainId: 2020 // Cambió de testnet a mainnet
});

// Contratos usan nuevos addresses automáticamente
const miningPool = contractManager.getMiningPool();
```

---

## ✅ Beneficios Arquitecturales

### **1. Separation of Concerns**
- ContractManager → Gestión
- Factories → Creación
- Interfaces → Contratos

### **2. Dependency Inversion**
```typescript
// ✅ Depende de interfaz, no implementación
class Service {
  constructor(private mining: IMiningContract) {}
}

// ❌ Depende de implementación concreta
class Service {
  constructor(private mining: ethers.Contract) {}
}
```

### **3. Testability**
```typescript
// Mock fácil
const mockMiningPool: IMiningContract = {
  startMining: jest.fn(),
  stopMining: jest.fn(),
  // ...
};

const service = new MiningService(mockContractManager);
```

### **4. Single Source of Truth**
- Un ContractManager → Usad o por toda la app
- Cambios en contratos → Un solo lugar

---

## 🧪 Testing

### **Mock de ContractManager**
```typescript
const mockContractManager = {
  getMiningPool: jest.fn().mockReturnValue(mockMiningPool),
  getForgeFactory: jest.fn().mockReturnValue(mockForge),
} as unknown as ContractManager;

// Usar en tests
const service = new MiningService(mockContractManager);
```

### **Mock de Factory**
```typescript
jest.mock('@/lib/contracts/factories/MiningPoolFactory', () => ({
  create: jest.fn().mockReturnValue(mockMiningContract)
}));
```

---

## 🔐 Seguridad

### **1. Validación de Addresses**
```typescript
if (!isAddress(address)) {
  throw new Error('Invalid contract address');
}
```

### **2. Error Handling**
```typescript
try {
  await contract.startMining(minerId);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Manejo específico
  }
  throw error;
}
```

### **3. Transaction Timeouts**
```typescript
const tx = await contract.forgeGeode(params);
await tx.wait(1, 60000); // 1 confirmación, 60s timeout
```

---

## 📚 Archivos Relacionados

- [`/lib/abis`](../abis/README.md) - ABIs usados por factories
- [`/lib/config`](../config/README.md) - Addresses de contratos
- [`/lib/services`](../services/README.md) - Services que usan ContractManager
- [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) - Arquitectura completa del proyecto

---

## 🎉 Estado Actual

**Proyecto:** 100% Completado  
**Interfaces:** 18 interfaces implementadas  
**Factories:** 15 factories activas  
**Contratos Desplegados:** 15+ en Ronin Testnet  
**Última actualización:** 21 Enero 2026

### Fases Completadas

- ✅ **Fase 11:** MinerStatsManager + Factory + Interface
- ✅ **Fase 12:** RecipeRegistry + Factory + Interface
- ✅ **Fase 13:** PriceOracle + Factory + Interface
- ✅ **Fase 14:** CollectionTracker + SetRegistry + Factories + Interfaces

**Todas las funcionalidades del whitepaper están implementadas con arquitectura consistente.**
