# 👨‍💻 ScorchCore - Guía de Desarrollo

**Para desarrolladores que se unen al proyecto**

---

## 🎯 Bienvenida

Esta guía te ayudará a comenzar a desarrollar en ScorchCore frontend. El proyecto está al **100% completo** con 14 módulos funcionales implementados.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura del Código](#estructura-del-código)
3. [Cómo Agregar una Nueva Feature](#cómo-agregar-una-nueva-feature)
4. [Patrones y Convenciones](#patrones-y-convenciones)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Git Workflow](#git-workflow)

---

## 🚀 Configuración Inicial

### Prerrequisitos

```bash
Node.js >= 18.x
npm >= 9.x
Git
MetaMask o wallet compatible
```

### Setup del Proyecto

```bash
# 1. Clonar repositorio
git clone [repo-url]
cd ScorchCoreWeb

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Configurar .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# 5. Iniciar desarrollo
npm run dev
```

### Configuración de IDE (VS Code)

Extensiones recomendadas:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Configuración de Ronin Testnet

```json
{
  "chainId": "0x7E5",
  "chainName": "Ronin Testnet",
  "nativeCurrency": {
    "name": "RON",
    "symbol": "RON",
    "decimals": 18
  },
  "rpcUrls": ["https://saigon-testnet.roninchain.com/rpc"],
  "blockExplorerUrls": ["https://saigon-app.roninchain.com"]
}
```

---

## 📁 Estructura del Código

### Arquitectura en Capas

```
Frontend (React/Next.js)
    ↓
Custom Hooks (React)
    ↓
Service Layer (Business Logic)
    ↓
Contract Manager (Singleton)
    ↓
Factories (Contract Instantiation)
    ↓
Interfaces (TypeScript Types)
    ↓
ethers.js / Blockchain
```

### Directorios Clave

| Directorio | Propósito | Reglas |
|------------|-----------|--------|
| `/src/app` | Páginas Next.js | Usar App Router |
| `/src/components` | Componentes UI | Solo presentación |
| `/src/lib/services` | Lógica de negocio | Sin React |
| `/src/lib/hooks` | React hooks | Reactivo |
| `/src/lib/contracts` | Contratos | Interfaces + Factories |
| `/src/lib/utils` | Utilidades | Pure functions |

---

## 🆕 Cómo Agregar una Nueva Feature

### Checklist Completo

#### 1. **Investigar el Contrato** 

```bash
# Ubicación de contratos
contracts_standard/contracts/[categoria]/[Contrato].sol
```

**Tareas:**
- [ ] Leer el contrato Solidity
- [ ] Identificar funciones públicas
- [ ] Entender eventos emitidos
- [ ] Revisar estructuras de datos
- [ ] Verificar dirección desplegada en `deployment.config.ts`

#### 2. **Crear Interface TypeScript**

**Ubicación:** `src/lib/contracts/interfaces/`

```typescript
// INewContract.ts
import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

export interface INewContract extends IBlockchainContract {
  // Funciones del contrato
  getData(): Promise<DataType>;
  setData(value: bigint): Promise<TransactionResult>;
}

export interface DataType {
  // Estructura de datos
}
```

**Pasos:**
1. Extender `IBlockchainContract`
2. Definir métodos públicos
3. Definir tipos de datos
4. Documentar con JSDoc

#### 3. **Crear Factory**

**Ubicación:** `src/lib/contracts/factories/`

```typescript
// NewContractFactory.ts
import { ethers } from 'ethers';
import type { Address } from 'viem';
import { NEWCONTRACT_ABI } from '@/lib/abis/category.abis';
import type { INewContract } from '../interfaces/INewContract';
import { createServiceLogger } from '@/lib/utils/logger';

const logger = createServiceLogger('NewContractFactory');

class NewContractImplementation implements INewContract {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract
  ) {}

  async getStatus() { /* ... */ }
  async isDeployed() { /* ... */ }
  on(eventName: string, callback: (event: unknown) => void) { /* ... */ }
  
  // Métodos del contrato
  async getData(): Promise<DataType> {
    try {
      const data = await this.contract.getData();
      return this.transformData(data);
    } catch (error) {
      logger.error('Error getting data', { error });
      throw error;
    }
  }
}

export class NewContractFactory {
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): INewContract {
    logger.info('Creating contract instance', { address, chainId });
    const contract = new ethers.Contract(address, NEWCONTRACT_ABI, providerOrSigner);
    return new NewContractImplementation(address, chainId, contract);
  }
}
```

#### 4. **Actualizar ContractManager**

**Ubicación:** `src/lib/contracts/ContractManager.ts`

```typescript
// 1. Importar factory
import { NewContractFactory } from './factories/NewContractFactory';
import type { INewContract } from './interfaces';

// 2. Agregar factory como propiedad
private newContractFactory: NewContractFactory;

// 3. Inicializar en constructor
this.newContractFactory = new NewContractFactory();

// 4. Agregar método getter
getNewContract(address?: Address): INewContract {
  const cacheKey = this.getCacheKey('NewContract', address);
  return this.getOrCreateContract(cacheKey, () => {
    const contractAddress = address || getContractAddress('NewContract') as Address;
    if (!this.config.signer && !this.config.provider) {
      throw new Error('NewContract requires a signer or provider');
    }
    return this.newContractFactory.create(
      contractAddress,
      this.config.chainId,
      this.config.signer || this.config.provider!
    );
  }) as INewContract;
}
```

#### 5. **Crear Service Layer**

**Ubicación:** `src/lib/services/newfeature/`

```typescript
// NewFeatureService.ts
import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { DataType } from '@/lib/contracts/interfaces/INewContract';
import { createServiceLogger } from '@/lib/utils/logger';

const log = createServiceLogger('NewFeatureService');

export interface DataForUI {
  // Datos transformados para UI
  value: number;
  formatted: string;
  status: 'active' | 'inactive';
}

export class NewFeatureService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  async getData(): Promise<DataForUI> {
    try {
      log.info('Getting data');

      const contract = this.contractManager.getNewContract();
      const rawData = await contract.getData();

      // Transformar datos para UI
      const uiData = this.transformForUI(rawData);

      log.info('Data retrieved', { uiData });

      return uiData;
    } catch (error) {
      log.error('Error getting data', { error });
      throw error;
    }
  }

  private transformForUI(data: DataType): DataForUI {
    // Lógica de transformación
    return {
      value: Number(data.value),
      formatted: this.formatValue(data.value),
      status: data.isActive ? 'active' : 'inactive',
    };
  }

  private formatValue(value: bigint): string {
    // Lógica de formato
    return `${value.toString()} units`;
  }
}

export function createNewFeatureService(contractManager: ContractManager): NewFeatureService {
  return new NewFeatureService(contractManager);
}
```

**Crear index.ts:**
```typescript
// index.ts
export { NewFeatureService, createNewFeatureService } from './NewFeatureService';
export type { DataForUI } from './NewFeatureService';
```

#### 6. **Crear Custom Hook**

**Ubicación:** `src/lib/hooks/`

```typescript
// useNewFeature.ts
import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from './useContractManager';
import { NewFeatureService, type DataForUI } from '@/lib/services/newfeature';

export interface UseNewFeatureReturn {
  data: DataForUI | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useNewFeature(
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseNewFeatureReturn {
  const contractManager = useContractManager();
  
  const [data, setData] = useState<DataForUI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!contractManager) {
      setData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new NewFeatureService(contractManager);
      const result = await service.getData();

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading data');
      setError(error);
      console.error('Error in useNewFeature:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !contractManager) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, contractManager, loadData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
```

#### 7. **Crear Componentes UI**

**Ubicación:** `src/components/newfeature/`

```typescript
// DataCard.tsx
import React from 'react';
import { Card, Badge, Loading } from '@/components/ui';
import { useNewFeature } from '@/lib/hooks/useNewFeature';

export interface DataCardProps {
  variant?: 'default' | 'compact';
}

export function DataCard({
  variant = 'default',
}: DataCardProps) {
  const { data, isLoading, error } = useNewFeature(true, 30000);

  if (isLoading && !data) {
    return (
      <Card variant="gradient" className="p-6">
        <Loading size="md" text="Cargando datos..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error</div>
          <div className="text-sm text-gray-400">
            No se pudo cargar los datos
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center text-gray-400">
          Sin datos disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card variant="gradient" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Datos</h3>
        <Badge variant={data.status === 'active' ? 'success' : 'default'}>
          {data.status}
        </Badge>
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">
        {data.formatted}
      </div>
      
      <div className="text-sm text-gray-400">
        Valor: {data.value}
      </div>
    </Card>
  );
}
```

**Crear index.ts:**
```typescript
// index.ts
export { DataCard } from './DataCard';
```

#### 8. **Integrar en Dashboard**

**Ubicación:** `src/app/dashboard/page.tsx`

```typescript
// Agregar import
import { DataCard } from '@/components/newfeature';

// Agregar en el JSX
<div className="mb-6">
  <DataCard />
</div>
```

#### 9. **Documentar**

Crear `README.md` en la carpeta del servicio:

```markdown
# New Feature Service

## Descripción
Servicio para gestionar [descripción].

## Funcionalidades
- getData() - Obtiene datos del contrato
- transformForUI() - Transforma para UI

## Uso
\`\`\`typescript
const service = new NewFeatureService(contractManager);
const data = await service.getData();
\`\`\`
```

---

## 📐 Patrones y Convenciones

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Interfaces** | PascalCase con I prefix | `INewContract` |
| **Types** | PascalCase | `DataForUI` |
| **Services** | PascalCase + Service | `NewFeatureService` |
| **Hooks** | camelCase + use prefix | `useNewFeature` |
| **Components** | PascalCase | `DataCard` |
| **Functions** | camelCase | `transformData` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |

### File Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Components** | PascalCase.tsx | `DataCard.tsx` |
| **Hooks** | camelCase.ts | `useNewFeature.ts` |
| **Services** | PascalCase.ts | `NewFeatureService.ts` |
| **Utils** | camelCase.ts | `formatValue.ts` |
| **Types** | camelCase.ts | `types.ts` |

### Code Style

```typescript
// ✅ BIEN
export interface UserData {
  id: number;
  name: string;
}

export function transformUserData(data: RawData): UserData {
  return {
    id: Number(data.id),
    name: data.name,
  };
}

// ❌ MAL
export interface userData {  // lowercase
  id: number;
  name: string;
}

export function TransformUserData(data: any): any {  // any types
  return {
    id: data.id,  // sin validación
    name: data.name,
  };
}
```

### TypeScript Best Practices

```typescript
// ✅ Usar tipos específicos
function processData(data: DataType): ProcessedData {
  // ...
}

// ❌ Evitar any
function processData(data: any): any {
  // ...
}

// ✅ Usar interfaces para objetos
export interface Config {
  apiKey: string;
  timeout: number;
}

// ✅ Usar type para unions/primitives
export type Status = 'active' | 'inactive' | 'pending';

// ✅ Usar optional chaining
const value = data?.nested?.value ?? 'default';

// ✅ Usar nullish coalescing
const count = data.count ?? 0;
```

### React Best Practices

```typescript
// ✅ useCallback para funciones estables
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// ✅ useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ Early returns para loading/error
if (isLoading) return <Loading />;
if (error) return <Error />;
if (!data) return <Empty />;

// ❌ Evitar inline functions en props
<Button onClick={() => doSomething()} />  // ❌
<Button onClick={handleClick} />  // ✅
```

---

## 🧪 Testing

### Estructura de Tests

```
src/
├── __tests__/
│   ├── services/
│   │   └── NewFeatureService.test.ts
│   ├── hooks/
│   │   └── useNewFeature.test.ts
│   └── components/
│       └── DataCard.test.tsx
```

### Test de Servicio

```typescript
// NewFeatureService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { NewFeatureService } from '../services/newfeature';

describe('NewFeatureService', () => {
  it('should get data correctly', async () => {
    const mockManager = createMockContractManager();
    const service = new NewFeatureService(mockManager);
    
    const data = await service.getData();
    
    expect(data).toBeDefined();
    expect(data.value).toBeGreaterThan(0);
  });
});
```

### Test de Hook

```typescript
// useNewFeature.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useNewFeature } from '../hooks/useNewFeature';

describe('useNewFeature', () => {
  it('should load data', async () => {
    const { result } = renderHook(() => useNewFeature());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

---

## 🐛 Debugging

### Logging

Usar el logger estructurado:

```typescript
import { createServiceLogger } from '@/lib/utils/logger';

const log = createServiceLogger('MyService');

// Niveles de log
log.info('Info message', { data });
log.warn('Warning message', { issue });
log.error('Error message', { error });
```

### React DevTools

1. Instalar React DevTools
2. Inspeccionar componentes
3. Ver props y state
4. Profiler para performance

### Network Debugging

```typescript
// Agregar logs en contratos
async getData(): Promise<Data> {
  logger.info('Calling getData');
  const data = await this.contract.getData();
  logger.info('getData response', { data });
  return data;
}
```

---

## 🔄 Git Workflow

### Branches

```bash
main          # Producción
develop       # Desarrollo
feature/*     # Nuevas features
bugfix/*      # Correcciones
hotfix/*      # Fixes urgentes
```

### Commit Messages

Formato: `type(scope): message`

```bash
feat(mining): add new mining pool
fix(wallet): resolve connection issue
docs(readme): update installation steps
refactor(services): simplify data transformation
style(ui): update button colors
test(hooks): add tests for useNewFeature
```

### Pull Request Checklist

- [ ] Código compilar sin errores
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Code review aprobado

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ethers.js Docs](https://docs.ethers.org/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

**¿Preguntas?** Contacta al equipo en Slack: #scorchcore-dev
