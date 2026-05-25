# 📜 ABIs - Contract Application Binary Interfaces

ABIs de contratos inteligentes para interactuar con la blockchain.

---

## 📂 Estructura

```
abis/
├── antibot.abis.ts     # ABIs de sistema anti-bot
├── core.abis.ts        # ABIs core del juego
├── economy.abis.ts     # ABIs de economía (tokens)
├── forge.abis.ts       # ABIs de forja de geodas
├── mining.abis.ts      # ABIs de minería
├── nft.abis.ts         # ABIs de NFTs
└── index.ts            # Barrel export
```

---

## 🎯 Propósito

Los ABIs definen la **interfaz pública** de los contratos inteligentes:
- Funciones que se pueden llamar
- Eventos que se pueden escuchar
- Tipos de parámetros y retornos

---

## 📖 ABIs Disponibles

### **Core** (`core.abis.ts`)
```typescript
export const CORE_GAME_ABI = [...] as const;
```
Funciones principales del sistema de juego.

---

### **Economy** (`economy.abis.ts`)
```typescript
export const ERC20_ABI = [...] as const;
export const FCORE_TOKEN_ABI = [...] as const;
```
ABIs de tokens ERC20 (AXS, SLP, FCORE, etc.).

---

### **Forge** (`forge.abis.ts`)
```typescript
export const FORGE_FACTORY_ABI = [...] as const;
export const FORGE_RECIPE_ABI = [...] as const;
```
ABIs para forjar geodas y recetas.

---

### **Mining** (`mining.abis.ts`)
```typescript
export const MINING_POOL_ABI = [...] as const;
export const MINER_STATS_MANAGER_ABI = [...] as const;
```
ABIs para minería y gestión de estadísticas.

---

### **NFT** (`nft.abis.ts`)
```typescript
export const GEODE_NFT_ABI = [...] as const;
export const COREMINERNFT_ABI = [...] as const;
export const AXIE_ABI = [...] as const;
export const MEMENTO_NFT_ABI = [...] as const;
```
ABIs de NFTs (Geodas, Core Miners, Axies, Mementos).

---

### **Anti-bot** (`antibot.abis.ts`)
```typescript
export const ANTIBOT_ABI = [...] as const;
```
Sistema de protección anti-bot.

---

## 🔧 Uso

### **En Factories**
```typescript
import { MINING_POOL_ABI } from '@/lib/abis';
import { ethers } from 'ethers';

export class MiningPoolFactory {
  static create(config: ContractConfig): IMiningContract {
    const contract = new ethers.Contract(
      config.address,
      MINING_POOL_ABI,  // ← ABI importado
      config.signerOrProvider
    );
    
    return {
      // Métodos tipados basados en el ABI
      startMining: (minerId: bigint) => contract.startMining(minerId),
      stopMining: (minerId: bigint) => contract.stopMining(minerId),
      // ...
    };
  }
}
```

### **En ContractManager**
```typescript
import { FORGE_FACTORY_ABI, COREMINERNFT_ABI } from '@/lib/abis';

export class ContractManager {
  getForgeFactory(): IForgeContract {
    return ForgeContractFactory.create({
      address: CONTRACT_ADDRESSES[this.chainId].FORGE_FACTORY,
      abi: FORGE_FACTORY_ABI,  // ← ABI usado
      signerOrProvider: this.signer
    });
  }
}
```

---

## 📝 Formato

### **Estructura de ABI**
```typescript
export const CONTRACT_ABI = [
  {
    type: "function",
    name: "functionName",
    inputs: [
      {
        name: "param1",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "result",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "EventName",
    inputs: [
      {
        name: "indexed1",
        type: "address",
        indexed: true
      }
    ]
  }
] as const;
```

### **Type Safety con `as const`**
```typescript
// ✅ CORRECTO - as const para type inference
export const ABI = [...] as const;

// ❌ INCORRECTO - sin as const
export const ABI = [...]; // Tipo: any[]
```

---

## 🔄 Actualización de ABIs

### **Desde Contratos Solidity**
1. Compilar contratos: `hardhat compile` o `forge build`
2. Extraer ABI del archivo JSON resultante
3. Copiar a archivo correspondiente en `abis/`
4. Agregar `as const` al final

### **Ejemplo:**
```bash
# Compilar contrato
cd ../contracts
npx hardhat compile

# Extraer ABI
cat artifacts/contracts/MiningPool.sol/MiningPool.json | jq '.abi' > ../web/src/lib/abis/mining-pool.json

# Formatear como TypeScript
# (Manual o con script)
```

---

## ✅ Beneficios

### **1. Type Safety**
```typescript
// ✅ TypeScript infiere tipos del ABI
const pool = new ethers.Contract(address, MINING_POOL_ABI, signer);
pool.startMining(minerId); // ← Autocomplete y type checking
```

### **2. Single Source of Truth**
- Un ABI → Usado por todos los factories
- Cambios en contratos → Actualizar un solo archivo

### **3. Versionamiento**
```typescript
// Versiones de ABIs si es necesario
export const MINING_POOL_ABI_V1 = [...] as const;
export const MINING_POOL_ABI_V2 = [...] as const;
```

---

## 🔍 Validación

### **Verificar ABIs**
```typescript
import { isAddress } from 'viem';

// Validar que funciones esperadas existan
const hasStartMining = MINING_POOL_ABI.some(
  item => item.type === 'function' && item.name === 'startMining'
);

if (!hasStartMining) {
  throw new Error('ABI inválido: falta función startMining');
}
```

---

## 📚 Archivos Relacionados

- [`/lib/contracts`](../contracts/README.md) - Factories que usan estos ABIs
- [`/lib/config`](../config/README.md) - Addresses de contratos

---

**Última actualización:** 20 Enero 2026
