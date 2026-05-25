# 🎣 Hooks Documentation

Hooks personalizados para ScorchCoreWeb organizados por funcionalidad.

## 📚 Tabla de Contenidos

- [Core Hooks](#core-hooks) - Infraestructura base
- [NFT Hooks](#nft-hooks) - Gestión de NFTs
- [Forge Hooks](#forge-hooks) - Forja y eclosión
- [Mining Hooks](#mining-hooks) - Operaciones de minería
- [Balance Hooks](#balance-hooks) - Consulta de balances

---

## 🔧 Core Hooks

### `useContractManager`

Proporciona acceso al singleton `ContractManager` con reactividad a cambios de red.

```tsx
import { useContractManager } from '@/lib/hooks';

function MyComponent() {
  const contractManager = useContractManager();
  
  const forgeContract = contractManager.getForgeFactory();
  // ...
}
```

### `useTokenService`

Proporciona acceso al servicio de tokens con caché automático.

```tsx
import { useTokenService } from '@/lib/hooks';

function TokenBalance() {
  const tokenService = useTokenService();
  const { address } = useAccount();
  
  const balance = await tokenService.getBalance(tokenAddress, address);
}
```

### `useWallet`

Hook simplificado para acceso a información de wallet (wrapper de wagmi).

```tsx
import { useWallet } from '@/lib/hooks';

function Component() {
  const { address, isConnected, chain } = useWallet();
  
  if (!isConnected) return <ConnectButton />;
  return <div>Connected: {address}</div>;
}
```

---

## 🎨 NFT Hooks

### `useNFTFacade`

Proporciona acceso al facade de NFTs.

```tsx
import { useNFTFacade } from '@/lib/hooks';

function NFTList() {
  const nftFacade = useNFTFacade();
  const { address } = useAccount();
  
  const miners = await nftFacade.getMinersFromWallet(address);
}
```

### `useNFTs`

Hook completo para gestión de NFTs del usuario (Miners y Axies).

```tsx
import { useNFTs } from '@/lib/hooks';

function InventoryPage() {
  const { miners, axies, isLoading, error, reload } = useNFTs({
    autoLoad: true,
    minersOnly: false,
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <NFTGrid miners={miners} axies={axies} />;
}
```

**Opciones:**
- `autoLoad?: boolean` - Cargar automáticamente al montar (default: true)
- `minersOnly?: boolean` - Solo cargar mineros (default: false)
- `axiesOnly?: boolean` - Solo cargar Axies (default: false)

---

## ⚒️ Forge Hooks

### `useForgeFacade`

Proporciona acceso al facade de Forge.

```tsx
import { useForgeFacade } from '@/lib/hooks';

function ForgePanel() {
  const forgeFacade = useForgeFacade();
  
  const result = await forgeFacade.forgeGeode({
    category: GeodeCategory.PLANT,
    axieClass: AxieClass.PLANT
  });
}
```

### `useInventoryFacade`

Proporciona acceso al facade de inventario.

```tsx
import { useInventoryFacade } from '@/lib/hooks';

function InventoryPanel() {
  const inventoryFacade = useInventoryFacade();
  const { address } = useAccount();
  
  const geodes = await inventoryFacade.getUserGeodes(address);
}
```

### `useForge`

Hook completo para operaciones de forja.

```tsx
import { useForge } from '@/lib/hooks';

function ForgePage() {
  const { 
    balances, 
    isLoading, 
    forgeGeode, 
    hatchGeode 
  } = useForge();
  
  const handleForge = async () => {
    const result = await forgeGeode({
      category: GeodeCategory.PLANT,
      axieClass: AxieClass.PLANT
    });
    
    if (result.success) {
      console.log('Geoda forjada:', result.geodeId);
    }
  };
  
  const handleHatch = async (geodeId: bigint) => {
    const result = await hatchGeode(geodeId);
    
    if (result.success) {
      console.log('Minero eclosionado:', result.minerId);
    }
  };
}
```

---

## ⛏️ Mining Hooks

### `useMining`

Hook para operaciones de minería (iniciar, detener, reclamar).

```tsx
import { useMining } from '@/lib/hooks';

function MiningPanel() {
  const { startMining, stopMining, claimRewards, isLoading } = useMining();
  
  const handleStartMining = async (minerId: bigint) => {
    const result = await startMining(minerId);
    if (result.success) {
      console.log('Minería iniciada!');
    }
  };
  
  const handleClaim = async (minerId: bigint) => {
    const result = await claimRewards(minerId);
    if (result.success) {
      console.log('Recompensas:', result.amount);
    }
  };
}
```

### `useMiningStats`

Hook para consultar estadísticas de minería en tiempo real.

```tsx
import { useMiningStats } from '@/lib/hooks';

function MinerCard({ minerId }: { minerId: bigint }) {
  const { stats, isLoading, reload } = useMiningStats(minerId, {
    autoLoad: true,
    refreshInterval: 30000, // 30 segundos
  });
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <p>Mining: {stats?.isMining ? 'Sí' : 'No'}</p>
      <p>Power: {stats?.minerInfo?.power.toString()}</p>
      <p>Pending Rewards: {stats?.pendingRewards?.totalAmount.toString()}</p>
    </div>
  );
}
```

**Opciones:**
- `autoLoad?: boolean` - Cargar automáticamente (default: true)
- `refreshInterval?: number` - Intervalo de recarga en ms (default: 30000)

---

## 💰 Balance Hooks

### `useMementoBalances`

Hook para consultar balances de Mementos (tokens por clase de Axie).

```tsx
import { useMementoBalances } from '@/lib/hooks';

function MementoPanel() {
  const { balances, isLoading, reload } = useMementoBalances({
    autoLoad: true,
    refreshInterval: 30000,
  });
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      {Object.entries(balances || {}).map(([axieClass, data]) => (
        <div key={axieClass}>
          {data.symbol}: {data.formatted}
        </div>
      ))}
    </div>
  );
}
```

**Opciones:**
- `autoLoad?: boolean` - Cargar automáticamente (default: true)
- `refreshInterval?: number` - Intervalo de recarga en ms (default: 30000)

---

## ✨ Nuevos Hooks - Fases 11-14

### `useMinerStatsHistory` ✨ **Fase 11**

Hook para tracking de estadísticas históricas de miners con health score.

```tsx
import { useMinerStatsHistory } from '@/lib/hooks/useMinerStatsHistory';

function MinerStatsCard({ minerId }: { minerId: bigint }) {
  const { stats, health, history, isLoading, error } = useMinerStatsHistory(
    minerId,
    true, // autoRefresh
    30000 // 30s interval
  );
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      <h3>Health Score: {health?.score}/100</h3>
      <p>Status: {health?.overall}</p>
      <p>Durability: {stats?.durabilityFormatted}</p>
      <p>Efficiency: {stats?.efficiencyFormatted}</p>
      {health?.warnings.map(w => <Alert key={w}>{w}</Alert>)}
    </div>
  );
}
```

**Características:**
- Health score calculation (0-100)
- Durability, efficiency, level tracking
- Warnings automáticos
- Auto-refresh opcional

---

### `useRecipes` ✨ **Fase 12**

Hook para gestión completa de recetas (lectura y CRUD admin).

```tsx
import { useRecipes } from '@/lib/hooks/useRecipes';

function RecipeAdminPanel() {
  const { 
    recipes, 
    isLoading, 
    error,
    createRecipe,
    toggleRecipe,
    refresh 
  } = useRecipes();
  
  const handleToggle = async (recipe: RecipeInfo) => {
    await toggleRecipe(recipe);
    refresh();
  };
  
  const handleCreate = async (newRecipe: RecipeInput) => {
    await createRecipe(newRecipe);
    refresh();
  };
  
  return (
    <RecipeManagerTable 
      recipes={recipes}
      onToggle={handleToggle}
      onRefresh={refresh}
    />
  );
}
```

**Funcionalidades:**
- CRUD de recetas
- Toggle activar/desactivar
- Verificación de rol admin
- Max supply management

---

### `usePriceOracle` ✨ **Fase 13**

Hook para integración con price oracle on-chain.

```tsx
import { usePriceOracle } from '@/lib/hooks/usePriceOracle';

function PriceDisplay() {
  const { 
    currentPrice, 
    priceInfo, 
    priceStats,
    isLoading,
    error 
  } = usePriceOracle(
    true,   // autoRefresh
    30000   // refresh cada 30s
  );
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <h2>${currentPrice?.toFixed(4)}</h2>
      <Badge variant={priceInfo?.isFresh ? 'success' : 'warning'}>
        {priceInfo?.isFresh ? 'Fresh' : 'Stale'}
      </Badge>
      <p>Age: {priceStats?.ageMinutes}min</p>
    </div>
  );
}
```

**Características:**
- Precio CORE en USD
- Fresh/Stale status
- Auto-refresh cada 30s
- Price history tracking
- Conversión CORE ↔ RON

---

### `useCollectionBonus` ✨ **Fase 14**

Hook para sistema de collection/set bonuses.

```tsx
import { useCollectionBonus } from '@/lib/hooks/useCollectionBonus';

function CollectionDisplay() {
  const { 
    allSets, 
    userProgress, 
    bonusSummary,
    isLoading,
    error,
    refresh 
  } = useCollectionBonus(false); // autoRefresh opcional
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <h3>Total Bonus: +{(bonusSummary?.totalBonus / 100).toFixed(2)}%</h3>
      <p>Sets Completados: {bonusSummary?.completedSets.length}</p>
      
      {userProgress?.map(progress => (
        <div key={progress.setId}>
          <h4>{progress.setName}</h4>
          <ProgressBar value={progress.progress} />
          {progress.isCompleted && <Badge>✅ Completado</Badge>}
        </div>
      ))}
    </div>
  );
}
```

**Sets Disponibles:**
- 🌙 Cazador Nocturno (+1.50%)
- 🌊 Ecosistema Acuático (+2.00%)
- ⚙️ Maquinaria Avanzada (+1.50%)

**Características:**
- Tracking de progreso por set
- Bonus total acumulativo
- Requisitos detallados
- Próximo set indicator

---

### Otros Hooks Implementados

#### `useEmissionSchedule` - Fase 10
Hook para visualizar schedule de emisión y halving.

#### `useBuyBackInfo` - Fase 6
Hook para métricas del fondo de buyback.

#### `useVesting` - Fase 10
Hook para gestión de vesting schedules.

#### `usefCoreBalance` - Fase 3
Hook para balance y conversión de fCORE.

#### `useCycleManager` - Fase 2
Hook para gestión de ciclos de minería.

#### `useAxies` - Fase 1
Hook para staking de Axies.

#### `useTrustScore` - Fase 4
Hook para sistema de trust score.

---

## 🏗️ Arquitectura

### Capas

```
┌─────────────────────────────────────────┐
│         COMPONENTES UI                  │
└─────────────┬───────────────────────────┘
              │ usa
┌─────────────▼───────────────────────────┐
│         CUSTOM HOOKS                    │
│  useNFTs, useForge, useMining, etc.    │
└─────────────┬───────────────────────────┘
              │ usa
┌─────────────▼───────────────────────────┐
│      HOOKS DE ABSTRACCIÓN               │
│  useNFTFacade, useTokenService, etc.   │
└─────────────┬───────────────────────────┘
              │ usa
┌─────────────▼───────────────────────────┐
│           FACADES                       │
│  NFTFacade, ForgeFacade, etc.          │
└─────────────┬───────────────────────────┘
              │ usa
┌─────────────▼───────────────────────────┐
│      ContractManager (Singleton)        │
└─────────────────────────────────────────┘
```

### Principios

1. ✅ **0 acceso directo a ethers.js** - Usar facades
2. ✅ **Logger estructurado** - No console.log
3. ✅ **Type safety 100%** - Todas las interfaces definidas
4. ✅ **Reactividad** - useMemo para optimización
5. ✅ **Error handling robusto** - instanceof Error

---

## 📝 Convenciones

### Naming

- Hooks de facade: `use{Nombre}Facade` (ej: `useForgeFacade`)
- Hooks de operaciones: `use{Nombre}` (ej: `useForge`, `useMining`)
- Hooks de infraestructura: `use{Nombre}` (ej: `useContractManager`)

### Estados

Todos los hooks que realizan operaciones async incluyen:
- `isLoading: boolean` - Indica operación en curso
- `error: string | null` - Mensaje de error
- `reload()` - Función para recargar datos

### Logger

Todos los hooks usan logger estructurado:

```tsx
import { createServiceLogger } from '@/lib/utils/logger';

const logger = createServiceLogger('HookName');

logger.info('Operación exitosa', { data });
logger.error('Error en operación', error);
```

---

## 🧪 Testing

Todos los hooks son testables con mocks:

```tsx
// Mock useContractManager
jest.mock('@/lib/hooks/useContractManager', () => ({
  useContractManager: () => mockContractManager
}));

// Test
it('should load miners', async () => {
  const { result } = renderHook(() => useNFTs());
  
  await waitFor(() => {
    expect(result.current.miners).toHaveLength(3);
  });
});
```

---

## 🔄 Migración desde Hooks Legacy

### Antes (Legacy)

```tsx
// ❌ Acceso directo a ethers
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(ADDRESS, ABI, provider);
const balance = await contract.balanceOf(address);
console.log('Balance:', balance);
```

### Ahora (Nuevo)

```tsx
// ✅ Usa hooks y facades
const tokenService = useTokenService();
const balance = await tokenService.getBalance(tokenAddress, address);
logger.info('Balance obtenido', { balance: balance.toString() });
```

---

## 📊 Resumen de Hooks

**Total de Hooks Implementados:** 20+

| Categoría | Hooks | Estado |
|-----------|-------|--------|
| Core | 3 | ✅ |
| NFTs | 2 | ✅ |
| Forge | 3 | ✅ |
| Mining | 2 | ✅ |
| Balance | 1 | ✅ |
| **Nuevos (Fases 11-14)** | **4** | ✅ |
| Economía | 4 | ✅ |
| Sistema | 3 | ✅ |

### Hooks con Auto-refresh

Los siguientes hooks soportan auto-refresh automático:

- ✅ `useMiningStats` - Cada 30s
- ✅ `useMinerStatsHistory` - Cada 30s (Fase 11)
- ✅ `usePriceOracle` - Cada 30s (Fase 13)
- ✅ `useCollectionBonus` - Opcional (Fase 14)
- ✅ `useEmissionSchedule` - Cada 60s
- ✅ `useBuyBackInfo` - Cada 30s

---

## 🎯 Patrón Estándar de Hook

Todos los hooks siguen este patrón consistente:

```typescript
export function useFeature(
  params: Params,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseFeatureReturn {
  const contractManager = useContractManager();
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    // Lógica de carga
  }, [contractManager, params]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  // Carga inicial
  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh };
}
```

---

## 📚 Archivos Relacionados

- [`/lib/services`](../services/README.md) - Services usados por hooks
- [`/lib/contracts`](../contracts/README.md) - ContractManager usado
- [`/lib/facades`](../facades/README.md) - Facades usados por hooks
- [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) - Arquitectura completa

---

## 🎉 Estado Actual

**Proyecto:** 100% Completado  
**Hooks Implementados:** 20+  
**Auto-refresh Hooks:** 6  
**Última actualización:** 21 Enero 2026

### Fases Completadas

- ✅ **Fase 11:** useMinerStatsHistory (stats + health)
- ✅ **Fase 12:** useRecipes (admin CRUD)
- ✅ **Fase 13:** usePriceOracle (precio on-chain)
- ✅ **Fase 14:** useCollectionBonus (sets + bonuses)

**Todos los hooks siguen el patrón estándar con TypeScript strict mode y auto-refresh opcional.**
