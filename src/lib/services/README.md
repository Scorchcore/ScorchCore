# ⚙️ Services - Lógica de Negocio

Servicios modulares que encapsulan la lógica de negocio del juego.

---

## 📂 Estructura

```
services/
├── TokenService.ts              # Servicio de tokens ERC20
├── TokenServiceCache.ts         # Wrapper con caché
├── base/                        # Servicios base abstractos
│   ├── BaseMiningService.ts
│   ├── BaseForgeService.ts
│   └── README.md
├── forge/                       # Servicios de forja
│   ├── ForgeTokenService.ts
│   ├── ForgeRecipeService.ts
│   ├── GeodeHatchService.ts
│   └── ForgeFacade.ts
├── mining/                      # Servicios de minería
│   ├── MiningSessionService.ts
│   ├── MiningRewardsService.ts
│   └── MiningFacade.ts
├── nft/                         # Servicios de NFTs
│   ├── MinerDataService.ts
│   └── types.ts
├── validation/                  # Validadores
│   └── ValidationService.ts
└── index.ts                     # Barrel export
```

---

## 🎯 Principios

### **Service Layer Pattern**
Los services encapsulan:
- ✅ Lógica de negocio
- ✅ Validaciones
- ✅ Transformación de datos
- ✅ Coordinación de operaciones

### **Separation of Concerns**
Cada service tiene una responsabilidad única:
- **TokenService** → Operaciones con tokens ERC20
- **ForgeTokenService** → Tokens específicos de forja
- **MiningRewardsService** → Cálculo de recompensas
- **MiningSessionService** → Gestión de sesiones de minería

---

## 📖 Services Principales

### **1. TokenService** - Tokens ERC20

**Propósito:** Operaciones genéricas con tokens ERC20.

```typescript
import { TokenService } from '@/lib/services';

const tokenService = new TokenService(contractManager);

// Obtener balance
const balance = await tokenService.getBalance(tokenAddress, userAddress);

// Verificar aprobación
const approval = await tokenService.checkApproval(
  tokenAddress,
  userAddress,
  spenderAddress,
  amount
);

// Aprobar tokens
await tokenService.approveToken(
  tokenAddress,
  spenderAddress,
  amount
);

// Obtener múltiples balances
const balances = await tokenService.getMultipleBalances(
  [
    { address: AXS_ADDRESS, symbol: 'AXS' },
    { address: SLP_ADDRESS, symbol: 'SLP' }
  ],
  userAddress
);
```

**Características:**
- ✅ Type-safe con viem types
- ✅ Formateo de balances
- ✅ Verificación de aprobaciones
- ✅ Batch de operaciones

---

### **2. TokenServiceCache** - Caché de Tokens

**Propósito:** Wrapper de TokenService con caché para reducir llamadas RPC.

```typescript
import { createCachedTokenService } from '@/lib/services';

const cachedTokenService = createCachedTokenService(tokenService, {
  ttl: 30000, // 30 segundos
  debug: true
});

// Usa caché automáticamente
const balance = await cachedTokenService.getBalance(tokenAddress, userAddress);
// Segunda llamada usa caché si está dentro de TTL
```

**Características:**
- ✅ TTL configurable
- ✅ Invalidación manual
- ✅ Debug mode
- ✅ Transparent caching

---

### **3. ForgeTokenService** - Tokens de Forja

**Propósito:** Gestión de tokens específicos para forja de geodas.

```typescript
import { ForgeTokenService } from '@/lib/services/forge';

const forgeService = new ForgeTokenService(contractManager);

// Verificar si tiene suficientes tokens
const canForge = await forgeService.hasRequiredTokens(
  userAddress,
  GeodeType.PETIT_BEAST
);

// Aprobar todos los tokens necesarios
await forgeService.approveAllForForge(
  GeodeType.PETIT_BEAST,
  forgeFactoryAddress
);
```

---

### **4. MiningRewardsService** - Recompensas de Minería

**Propósito:** Cálculos de recompensas y estadísticas de minería.

```typescript
import { MiningRewardsService } from '@/lib/services/mining';

const rewardsService = new MiningRewardsService(contractManager);

// Estimar recompensas por hora
const rewardsPerHour = await rewardsService.estimateRewardsPerHour(
  minerPower,
  minerEfficiency
);

// Calcular total acumulado
const totalEarned = await rewardsService.calculateTotalEarned(minerId);

// Estimar para período
const estimated = await rewardsService.estimateRewardsForPeriod(
  minerPower,
  minerEfficiency,
  24 // horas
);
```

---

### **5. MiningSessionService** - Sesiones de Minería

**Propósito:** Gestión de sesiones activas de minería.

```typescript
import { MiningSessionService } from '@/lib/services/mining';

const sessionService = new MiningSessionService(contractManager);

// Obtener sesión activa
const session = await sessionService.getActiveSession(minerId);

// Obtener todas las sesiones activas
const sessions = await sessionService.getActiveSessions(minerIds);

// Verificar estado
const isActive = await sessionService.isSessionActive(minerId);
```

---

## 🏗️ Base Services

### **BaseMiningService** - Servicio Base de Minería

Clase abstracta con funcionalidad común para services de minería:

```typescript
export abstract class BaseMiningService {
  constructor(protected contractManager: ContractManager) {}
  
  protected async getMiningContract(): Promise<IMiningContract> {
    return this.contractManager.getMiningPool();
  }
  
  protected logger = createServiceLogger('MiningService');
}
```

---

## 🎯 Uso en Facades

```typescript
import { ForgeTokenService } from '@/lib/services/forge';
import { MiningRewardsService } from '@/lib/services/mining';

export class ForgeFacade {
  private forgeTokenService: ForgeTokenService;
  
  constructor(contractManager: ContractManager) {
    this.forgeTokenService = new ForgeTokenService(contractManager);
  }
  
  async canForgeGeode(
    userAddress: Address,
    geodeType: GeodeType
  ): Promise<boolean> {
    return this.forgeTokenService.hasRequiredTokens(userAddress, geodeType);
  }
}
```

---

## ✅ Beneficios

### **1. Reusabilidad**
```typescript
// ✅ Service reutilizable en múltiples facades
const forgeTokenService = new ForgeTokenService(contractManager);
// Usado por ForgeFacade, InventoryFacade, etc.
```

### **2. Testability**
```typescript
// Mock fácil del service
const mockTokenService = {
  getBalance: jest.fn().mockResolvedValue(1000n),
  checkApproval: jest.fn().mockResolvedValue({ isApproved: true })
};
```

### **3. Separation of Concerns**
- Services → Lógica de negocio
- Facades → Coordinación
- Hooks → UI binding

### **4. Type Safety**
```typescript
// ✅ Tipos inferidos automáticamente
const balance = await tokenService.getBalance(address, user);
//    ^ Type: bigint
```

---

## 🧪 Testing

### **Unit Tests**
```typescript
import { TokenService } from '@/lib/services';

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockContractManager: ContractManager;
  
  beforeEach(() => {
    mockContractManager = createMockContractManager();
    tokenService = new TokenService(mockContractManager);
  });
  
  it('should get token balance', async () => {
    const balance = await tokenService.getBalance(TOKEN_ADDRESS, USER_ADDRESS);
    expect(balance).toBeGreaterThan(0n);
  });
});
```

---

## 📊 Estructura de Datos

### **TokenBalance**
```typescript
interface TokenBalance {
  address: Address;
  symbol: string;
  balance: bigint;
  formatted: string;
  decimals: number;
}
```

### **ApprovalStatus**
```typescript
interface ApprovalStatus {
  isApproved: boolean;
  allowance: bigint;
  needed: bigint;
}
```

### **MiningSession**
```typescript
interface MiningSession {
  minerId: bigint;
  startTime: number;
  isActive: boolean;
  pendingRewards: bigint;
}
```

---

## 🔄 Dependency Injection

Todos los services reciben `ContractManager` por inyección:

```typescript
// ✅ CORRECTO - DI
export class ForgeService {
  constructor(private contractManager: ContractManager) {}
}

// ❌ INCORRECTO - Instanciación directa
export class ForgeService {
  private contractManager = ContractManager.getInstance();
}
```

---

## 📚 Archivos Relacionados

- [`/lib/contracts`](../contracts/README.md) - ContractManager
- [`/lib/facades`](../facades/README.md) - Facades que usan services
- [`/lib/hooks`](../hooks/README.md) - Hooks que usan facades

---

**Última actualización:** 20 Enero 2026
