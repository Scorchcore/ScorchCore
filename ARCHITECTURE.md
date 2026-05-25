# 🏗️ ScorchCore - Arquitectura Frontend

**Versión:** 1.0.0  
**Última actualización:** 21 Enero 2026  
**Estado:** Producción - 100% Completo

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Patrones Arquitectónicos](#patrones-arquitectónicos)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Capa de Contratos](#capa-de-contratos)
5. [Capa de Servicios](#capa-de-servicios)
6. [Capa de Hooks](#capa-de-hooks)
7. [Capa de Componentes](#capa-de-componentes)
8. [Flujo de Datos](#flujo-de-datos)
9. [Decisiones de Diseño](#decisiones-de-diseño)

---

## 🎯 Visión General

ScorchCore frontend es una aplicación Web3 construida con **Next.js 16**, **TypeScript**, y **TailwindCSS**, diseñada para interactuar con un ecosistema completo de contratos inteligentes en Ronin Network.

### Características Principales

- ✅ **14 Módulos Funcionales** completamente implementados
- ✅ **136+ Archivos** de código personalizado
- ✅ **Service Layer Pattern** consistente
- ✅ **Factory Pattern** para todos los contratos
- ✅ **Custom Hooks** reactivos con auto-refresh
- ✅ **TypeScript Strict Mode** habilitado
- ✅ **Logging Estructurado** centralizado

---

## 🏛️ Patrones Arquitectónicos

### 1. **Service Layer Pattern (DDD)**

Cada funcionalidad tiene un servicio dedicado que encapsula la lógica de negocio:

```typescript
// Ejemplo: MinerStatsService
export class MinerStatsService {
  private contractManager: ContractManager;
  
  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }
  
  async getMinerStats(minerId: bigint): Promise<MinerStatsUI> {
    // Lógica de negocio encapsulada
  }
}
```

**Beneficios:**
- Separación de responsabilidades
- Fácil testing unitario
- Reutilización de lógica
- Single Source of Truth

### 2. **Factory Pattern (GoF)**

Cada contrato tiene una factory que maneja su instanciación:

```typescript
export class MinerStatsManagerFactory {
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): IMinerStatsManager {
    const contract = new ethers.Contract(address, ABI, providerOrSigner);
    return new MinerStatsManagerContract(address, chainId, contract);
  }
}
```

**Beneficios:**
- Instanciación consistente
- Abstracción de ethers.js
- Fácil mock para testing
- Configuración centralizada

### 3. **Singleton Pattern (GoF)**

`ContractManager` es un singleton que gestiona todas las instancias de contratos:

```typescript
export class ContractManager {
  private static instance: ContractManager;
  
  static getInstance(config?: ContractManagerConfig): ContractManager {
    if (!ContractManager.instance) {
      ContractManager.instance = new ContractManager(config!);
    }
    return ContractManager.instance;
  }
}
```

**Beneficios:**
- Cache de contratos
- Configuración global
- Evita instanciaciones múltiples
- Performance optimizado

### 4. **Custom Hook Pattern (React)**

Cada servicio tiene un hook personalizado para React:

```typescript
export function useMinerStatsHistory(
  minerId: bigint | null,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseMinerStatsHistoryReturn {
  // Lógica reactiva con auto-refresh
}
```

**Beneficios:**
- Estado reactivo automático
- Auto-refresh opcional
- Error handling integrado
- Loading states

### 5. **Observer Pattern**

Hooks implementan observer pattern para eventos blockchain:

```typescript
useEffect(() => {
  if (!autoRefresh || !minerId) return;
  
  const interval = setInterval(() => {
    loadMinerStats();
  }, refreshInterval);
  
  return () => clearInterval(interval);
}, [autoRefresh, refreshInterval, minerId]);
```

### 6. **Facade Pattern**

`ContractManager` actúa como facade para acceso a contratos:

```typescript
const manager = ContractManager.getInstance();
const miningPool = manager.getMiningPool();
const minerStats = manager.getMinerStatsManager();
```

---

## 📁 Estructura del Proyecto

```
ScorchCoreWeb/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── staking/           # Staking de miners
│   │   ├── admin/             # Paneles admin
│   │   └── economy/           # Métricas económicas
│   │
│   ├── components/            # Componentes UI
│   │   ├── ui/               # Componentes base
│   │   ├── minerstats/       # Stats de miners
│   │   ├── recipe/           # Admin de recetas
│   │   ├── price/            # Precio de tokens
│   │   ├── collection/       # Bonuses de sets
│   │   ├── emission/         # Emission schedule
│   │   ├── buyback/          # BuyBack fund
│   │   ├── vesting/          # Vesting manager
│   │   ├── fcore/            # fCORE system
│   │   ├── cycle/            # Cycle system
│   │   ├── axie/             # Axie staking
│   │   └── trust/            # Trust score
│   │
│   ├── lib/
│   │   ├── contracts/        # Capa de contratos
│   │   │   ├── interfaces/  # TypeScript interfaces
│   │   │   ├── factories/   # Contract factories
│   │   │   └── ContractManager.ts
│   │   │
│   │   ├── services/        # Service Layer
│   │   │   ├── minerstats/
│   │   │   ├── recipe/
│   │   │   ├── price/
│   │   │   ├── collection/
│   │   │   └── ...
│   │   │
│   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── useMinerStatsHistory.ts
│   │   │   ├── useRecipes.ts
│   │   │   ├── usePriceOracle.ts
│   │   │   └── useCollectionBonus.ts
│   │   │
│   │   ├── abis/            # Contract ABIs
│   │   ├── config/          # Configuración
│   │   ├── utils/           # Utilidades
│   │   └── providers/       # Context providers
│   │
│   └── styles/              # CSS Global
│
├── public/                  # Archivos estáticos
├── ARCHITECTURE.md          # Este archivo
├── DEVELOPMENT.md           # Guía de desarrollo
└── README.md               # Documentación principal
```

---

## 🔗 Capa de Contratos

### Jerarquía de Interfaces

```
IBlockchainContract (base)
    ├── IMiningContract
    ├── IForgeContract
    ├── IERC20Contract
    ├── IEconomyContract
    │   ├── IBuyBackFund
    │   ├── IRoyaltyContract
    │   ├── ITrustScoreContract
    │   ├── IVestingManager
    │   ├── IEmissionSchedule
    │   └── IPriceOracle
    ├── IRecipeRegistry
    ├── ICollectionTracker
    └── ISetRegistry
```

### Factory Registry

Cada contrato tiene su factory registrada en `ContractManager`:

| Contrato | Factory | Interface |
|----------|---------|-----------|
| MiningPool | MiningPoolFactory | IMiningContract |
| ForgeContract | ForgeContractFactory | IForgeContract |
| MinerStatsManager | MinerStatsManagerFactory | IMinerStatsManager |
| RecipeRegistry | RecipeRegistryFactory | IRecipeRegistry |
| PriceOracle | PriceOracleFactory | IPriceOracle |
| CollectionTracker | CollectionTrackerFactory | ICollectionTracker |
| SetRegistry | SetRegistryFactory | ISetRegistry |

### ContractManager API

```typescript
// Singleton instance
const manager = ContractManager.getInstance({
  chainId: 2021,
  provider: ethersProvider,
  signer: ethersSigner
});

// Obtener contratos
const mining = manager.getMiningPool();
const stats = manager.getMinerStatsManager();
const forge = manager.getForgeContract();
const recipes = manager.getRecipeRegistry();
const price = manager.getPriceOracle();
const collections = manager.getCollectionTracker();
const sets = manager.getSetRegistry();

// Cache automático
manager.clearCache(); // Limpiar si es necesario
```

---

## ⚙️ Capa de Servicios

### Catálogo de Servicios

| Servicio | Responsabilidad | LOC |
|----------|----------------|-----|
| **MinerStatsService** | Cálculos de salud y stats | 332 |
| **RecipeService** | CRUD de recetas | 420 |
| **PriceOracleService** | Precios y conversiones | 280 |
| **CollectionService** | Progreso de sets | 230 |
| **EmissionService** | Schedule de emisión | 180 |
| **BuyBackService** | Métricas de buyback | 150 |
| **VestingService** | Schedules de vesting | 200 |
| **fCoreService** | Conversiones fCORE | 160 |
| **TrustScoreService** | Cálculo de trust | 140 |

### Ejemplo de Servicio Completo

```typescript
// services/minerstats/MinerStatsService.ts
export class MinerStatsService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  async getMinerStats(minerId: bigint): Promise<MinerStatsUI> {
    const manager = this.contractManager.getMinerStatsManager();
    const stats = await manager.getStats(minerId);
    
    return this.enrichStatsForUI(stats);
  }

  calculateHealthScore(stats: MinerStats): number {
    // Lógica de cálculo
  }

  private enrichStatsForUI(stats: MinerStats): MinerStatsUI {
    // Transformación para UI
  }
}
```

---

## 🎣 Capa de Hooks

### Catálogo de Hooks Personalizados

| Hook | Servicio | Auto-refresh | Estado |
|------|----------|--------------|--------|
| `useMinerStatsHistory` | MinerStatsService | ✅ 30s | Reactivo |
| `useRecipes` | RecipeService | Opcional | Reactivo |
| `usePriceOracle` | PriceOracleService | ✅ 30s | Reactivo |
| `useCollectionBonus` | CollectionService | Opcional | Reactivo |
| `useEmissionSchedule` | EmissionService | ✅ 60s | Reactivo |
| `useBuyBackInfo` | BuyBackService | ✅ 30s | Reactivo |

### Patrón de Hook Estándar

```typescript
export function useServiceName(
  params: Params,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseServiceNameReturn {
  const contractManager = useContractManager();
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!contractManager) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = new Service(contractManager);
      const result = await service.getData(params);
      
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager, params]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}
```

---

## 🎨 Capa de Componentes

### Jerarquía de Componentes

```
UI Base (components/ui/)
├── Button
├── Card
├── Badge
├── Modal
├── Loading
└── Toast

Feature Components
├── minerstats/
│   ├── MinerStatsHistoryCard
│   ├── MinerPerformanceChart
│   └── MinerComparisonTable
├── recipe/
│   ├── RecipeManagerTable
│   └── AddRecipeModal
├── price/
│   ├── TokenPriceCard
│   └── TokenConverterWidget
└── collection/
    ├── CollectionProgressCard
    └── SetBonusIndicator
```

### Patrón de Componente Presentacional

```typescript
export interface ComponentProps {
  data: Data;
  variant?: 'default' | 'compact';
  onAction?: () => void;
  className?: string;
}

export function Component({
  data,
  variant = 'default',
  onAction,
  className = '',
}: ComponentProps) {
  // Lógica de renderizado pura
  // No lógica de negocio
  // No llamadas directas a contratos
  
  return (
    <Card className={className}>
      {/* UI */}
    </Card>
  );
}
```

---

## 🔄 Flujo de Datos

### Flujo de Lectura (Query)

```
Usuario Interactúa
    ↓
Componente UI
    ↓
Custom Hook (useServiceName)
    ↓
Service Layer (ServiceName)
    ↓
ContractManager
    ↓
Factory Pattern
    ↓
Contract Instance (ethers.js)
    ↓
Blockchain (Ronin Network)
    ↓
Response
    ↓
Service transforma datos
    ↓
Hook actualiza estado
    ↓
Componente re-renderiza
```

### Flujo de Escritura (Mutation)

```
Usuario hace click
    ↓
Componente llama función del Hook
    ↓
Hook llama método del Service
    ↓
Service prepara transacción
    ↓
ContractManager obtiene contrato
    ↓
Contract ejecuta transacción
    ↓
Espera confirmación
    ↓
Service procesa resultado
    ↓
Hook actualiza estado (success/error)
    ↓
Componente muestra feedback
    ↓
Hook llama refresh automático
```

---

## 🎯 Decisiones de Diseño

### 1. **¿Por qué Service Layer?**

**Problema:** Lógica de negocio dispersa en componentes  
**Solución:** Servicios reutilizables y testeables  
**Beneficio:** Single Source of Truth

### 2. **¿Por qué Factory Pattern?**

**Problema:** Instanciación manual de contratos propensa a errores  
**Solución:** Factories estandarizadas  
**Beneficio:** Consistencia y mockeable

### 3. **¿Por qué Singleton en ContractManager?**

**Problema:** Múltiples instancias con providers diferentes  
**Solución:** Instancia única con cache  
**Beneficio:** Performance y consistencia

### 4. **¿Por qué Custom Hooks en lugar de React Query?**

**Decisión:** Custom hooks con auto-refresh  
**Razón:** Control total sobre polling blockchain  
**Ventaja:** Optimizado para Web3

### 5. **¿Por qué TypeScript Strict Mode?**

**Decisión:** Strict mode habilitado  
**Razón:** Prevención de errores en tiempo de compilación  
**Resultado:** 0 errores de tipo en producción

### 6. **¿Por qué ethers.js v6?**

**Decisión:** ethers.js v6 sobre viem  
**Razón:** Madurez y ecosistema  
**Consideración:** Posible migración futura a viem

### 7. **¿Por qué Next.js 16 App Router?**

**Decisión:** App Router sobre Pages Router  
**Razón:** Server Components y mejor performance  
**Resultado:** Mejoras en SEO y carga inicial

---

## 📊 Métricas del Proyecto

### Cobertura de Funcionalidades

| Categoría | Features | Completadas | %  |
|-----------|----------|-------------|-----|
| **Críticas** | 6 | 6 | 100% |
| **Importantes** | 5 | 5 | 100% |
| **Opcionales** | 1 | 1 | 100% |
| **TOTAL** | 12 | 12 | **100%** |

### Distribución de Código

| Capa | Archivos | LOC | % |
|------|----------|-----|---|
| Contratos | 28 | ~5,000 | 25% |
| Servicios | 30 | ~4,500 | 22% |
| Hooks | 20 | ~3,000 | 15% |
| Componentes | 40 | ~6,000 | 30% |
| Utils | 18 | ~1,500 | 8% |

### Patrones Implementados

- ✅ Service Layer Pattern - 12 servicios
- ✅ Factory Pattern - 15 factories
- ✅ Singleton Pattern - 1 (ContractManager)
- ✅ Observer Pattern - 12 hooks con auto-refresh
- ✅ Facade Pattern - 1 (ContractManager)
- ✅ Strategy Pattern - Variantes de componentes

---

## 🔐 Seguridad

### Buenas Prácticas Implementadas

1. **TypeScript Strict** - Prevención de errores
2. **Input Validation** - Validación en servicios
3. **Error Boundaries** - Manejo de errores React
4. **Logging Estructurado** - Trazabilidad
5. **No Private Keys en Frontend** - Solo MetaMask
6. **Gas Estimation** - Antes de transacciones
7. **Transaction Retry Logic** - Reintentos automáticos

---

## 🚀 Performance

### Optimizaciones Implementadas

1. **Contract Caching** - Singleton + Cache
2. **Lazy Loading** - Code splitting por ruta
3. **Auto-refresh Optimizado** - Polling inteligente
4. **Memoization** - useCallback/useMemo
5. **Image Optimization** - next/image
6. **CSS-in-JS** - TailwindCSS (compile-time)

---

## 📚 Referencias

- [Documentación de Desarrollo](./DEVELOPMENT.md)
- [Guía de Servicios](./src/lib/services/README.md)
- [Guía de Hooks](./src/lib/hooks/README.md)
- [Guía de Componentes](./src/components/README.md)
- [Contratos](./src/lib/contracts/README.md)

---

**Mantenido por:** Equipo ScorchCore  
**Última revisión:** 21 Enero 2026  
**Versión de arquitectura:** 1.0.0
