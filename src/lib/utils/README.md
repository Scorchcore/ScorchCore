# 🛠️ Utils - Utilidades y Helpers

Funciones de utilidad reutilizables para formateo, validación, logging, etc.

---

## 📂 Estructura

```
utils/
├── logger.ts              # Sistema de logging estructurado
├── format.ts              # Formateo de números, balances
├── errorHandler.ts        # Manejo centralizado de errores
├── minerNames.ts          # Utilidades para nombres de mineros
├── nft.ts                 # Utilidades para NFTs
├── validation.ts          # Validadores
└── index.ts               # Barrel export
```

---

## 📖 Utilidades Disponibles

### **1. Logger** (`logger.ts`)

**Sistema de logging estructurado** que reemplaza console.log.

```typescript
import { createServiceLogger } from '@/lib/utils/logger';

const logger = createServiceLogger('MyService');

// Niveles de log
logger.debug('Debug info', { data: someData });
logger.info('Operation successful', { userId: 123 });
logger.warn('Warning occurred', { reason: 'timeout' });
logger.error('Error happened', error, { context: 'additional info' });
```

**Configuración:**
```typescript
// logger.ts
export const createServiceLogger = (serviceName: string) => {
  return new Logger({
    serviceName,
    level: process.env.NODE_ENV === 'production' 
      ? LogLevel.INFO 
      : LogLevel.DEBUG,
    enableConsole: true,
    enableRemote: false // Para producción: true
  });
};
```

**Características:**
- ✅ Niveles: DEBUG, INFO, WARN, ERROR
- ✅ Contexto estructurado (JSON)
- ✅ Timestamps automáticos
- ✅ Filtrado por nivel
- ✅ Ready para enviar a servicios externos

---

### **2. Format** (`format.ts`)

**Formateo de números, balances y valores.**

```typescript
import { 
  formatBalance, 
  formatNumber, 
  formatPercentage,
  formatTime 
} from '@/lib/utils/format';

// Formatear balance de token
const formatted = formatBalance(1234567890000000000n, 18);
// → "1.23"

// Formatear número grande
const readableNumber = formatNumber(1234567);
// → "1,234,567"

// Formatear porcentaje
const percentage = formatPercentage(0.156);
// → "15.6%"

// Formatear tiempo
const timeLeft = formatTime(3665);
// → "1h 1m 5s"
```

**Funciones:**
- `formatBalance(amount: bigint, decimals: number): string`
- `formatNumber(num: number): string`
- `formatPercentage(value: number): string`
- `formatTime(seconds: number): string`
- `formatAddress(address: Address): string` → "0x1234...5678"

---

### **3. Error Handler** (`errorHandler.ts`)

**Manejo centralizado de errores blockchain.**

```typescript
import { handleContractError, ContractError } from '@/lib/utils/errorHandler';

try {
  await contract.startMining(minerId);
} catch (error) {
  const handled = handleContractError(error);
  
  if (handled.code === 'USER_REJECTED') {
    // Usuario rechazó transacción
  } else if (handled.code === 'INSUFFICIENT_FUNDS') {
    // Sin fondos
  }
  
  logger.error(handled.message, handled.originalError);
}
```

**Tipos de Errores:**
```typescript
enum ErrorCode {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_PARAMS = 'INVALID_PARAMS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}
```

---

### **4. Miner Names** (`minerNames.ts`)

**Utilidades para nombres de mineros.**

```typescript
import { getMinerName, getMinerNameList } from '@/lib/utils/minerNames';

// Obtener nombre de minero
const name = getMinerName(MinerType.BEAST, 3);
// → "Pack Leader"

// Obtener lista completa
const names = getMinerNameList(MinerType.AQUA);
// → ["Deep Diver", "Wave Rider", ...]
```

**Características:**
- ✅ 10 nombres por tipo de minero
- ✅ Fallback si índice inválido
- ✅ Type-safe

---

### **5. NFT Utils** (`nft.ts`)

**Utilidades para NFTs.**

```typescript
import { 
  isContractDeployed,
  parseTokenURI,
  generateMetadata 
} from '@/lib/utils/nft';

// Verificar si contrato está desplegado
const deployed = await isContractDeployed(contract);

// Parsear token URI
const metadata = await parseTokenURI(tokenURI);

// Generar metadata fallback
const fallbackMetadata = generateMetadata(minerId, minerData);
```

---

### **6. Validation** (`validation.ts`)

**Validadores comunes.**

```typescript
import { 
  isValidAddress,
  isValidAmount,
  isPositiveBigInt 
} from '@/lib/utils/validation';

// Validar address
if (!isValidAddress(address)) {
  throw new Error('Invalid address');
}

// Validar amount
if (!isValidAmount(amount, userBalance)) {
  throw new Error('Insufficient balance');
}

// Validar bigint positivo
if (!isPositiveBigInt(minerId)) {
  throw new Error('Invalid miner ID');
}
```

---

## 🎯 Uso en Services

```typescript
import { createServiceLogger } from '@/lib/utils/logger';
import { formatBalance } from '@/lib/utils/format';
import { handleContractError } from '@/lib/utils/errorHandler';

export class TokenService {
  private logger = createServiceLogger('TokenService');
  
  async getFormattedBalance(
    tokenAddress: Address,
    userAddress: Address,
    decimals: number
  ): Promise<string> {
    try {
      const balance = await this.getBalance(tokenAddress, userAddress);
      return formatBalance(balance, decimals);
    } catch (error) {
      const handled = handleContractError(error);
      this.logger.error('Failed to get balance', handled.originalError);
      throw handled;
    }
  }
}
```

---

## 🎯 Uso en Componentes

```typescript
import { formatBalance, formatTime } from '@/lib/utils';

function MinerCard({ miner }) {
  const powerFormatted = formatNumber(miner.power);
  const timeLeft = formatTime(miner.cooldownRemaining);
  
  return (
    <div>
      <p>Power: {powerFormatted}</p>
      <p>Cooldown: {timeLeft}</p>
    </div>
  );
}
```

---

## ✅ Beneficios

### **1. DRY (Don't Repeat Yourself)**
```typescript
// ✅ Usar util
const formatted = formatBalance(balance, 18);

// ❌ Repetir lógica
const formatted = (Number(balance) / 1e18).toFixed(2);
```

### **2. Consistencia**
- Mismo formato en toda la app
- Mismo manejo de errores
- Mismo sistema de logs

### **3. Testability**
```typescript
// Test simple de util
expect(formatBalance(1000000000000000000n, 18)).toBe('1.00');
```

### **4. Mantenibilidad**
- Cambiar formato → Un solo archivo
- Agregar nueva validación → Un lugar

---

## 🧪 Testing

### **Format Utils**
```typescript
import { formatBalance, formatTime } from '@/lib/utils/format';

describe('Format Utils', () => {
  it('should format balance correctly', () => {
    expect(formatBalance(1234567890000000000n, 18)).toBe('1.23');
  });
  
  it('should format time correctly', () => {
    expect(formatTime(3665)).toBe('1h 1m 5s');
  });
});
```

### **Validation Utils**
```typescript
import { isValidAddress } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  it('should validate address', () => {
    expect(isValidAddress('0x1234...')).toBe(true);
    expect(isValidAddress('invalid')).toBe(false);
  });
});
```

---

## 📊 Logger Output

### **Development**
```
[2026-01-20T03:20:15.123Z] INFO [TokenService] Balance fetched
  userId: "0x1234..."
  balance: "1.23 AXS"
  
[2026-01-20T03:20:16.456Z] ERROR [ForgeService] Failed to forge geode
  error: "Insufficient AXS"
  required: "10"
  available: "5"
```

### **Production**
```json
{
  "timestamp": "2026-01-20T03:20:15.123Z",
  "level": "INFO",
  "service": "TokenService",
  "message": "Balance fetched",
  "context": {
    "userId": "0x1234...",
    "balance": "1.23 AXS"
  }
}
```

---

## 🔄 Agregar Nueva Utilidad

**1. Crear archivo:**
```typescript
// utils/myUtil.ts
export function myUtilFunction(param: string): string {
  return param.toUpperCase();
}
```

**2. Exportar en index:**
```typescript
// utils/index.ts
export * from './myUtil';
```

**3. Usar:**
```typescript
import { myUtilFunction } from '@/lib/utils';
```

---

## 📚 Archivos Relacionados

- [`/lib/services`](../services/README.md) - Services que usan utils
- [`/lib/hooks`](../hooks/README.md) - Hooks que usan utils
- [`/lib/constants`](../constants/README.md) - Constantes usadas en utils

---

**Última actualización:** 20 Enero 2026
