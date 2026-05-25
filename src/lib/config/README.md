# ⚙️ Config - Configuración del Proyecto

Configuración centralizada por ambiente y red.

---

## 📂 Contenido

```
config/
├── contracts.ts     # Addresses de contratos por red
├── tokens.ts        # Addresses de tokens ERC20
└── index.ts         # Barrel export
```

---

## 📖 Configuraciones Disponibles

### **🔗 Contract Addresses (`contracts.ts`)**

Addresses de contratos inteligentes organizados por `chainId`.

```typescript
import { CONTRACT_ADDRESSES } from '@/lib/config/contracts';

// Obtener address para la red actual
const miningPoolAddress = CONTRACT_ADDRESSES[chainId].MINING_POOL;
const forgeFactoryAddress = CONTRACT_ADDRESSES[chainId].FORGE_FACTORY;

// Ronin Mainnet (chainId: 2020)
CONTRACT_ADDRESSES[2020] = {
  MINING_POOL: '0x...',
  FORGE_FACTORY: '0x...',
  MINER_STATS_MANAGER: '0x...',
  GEODE_NFT: '0x...',
  CORE_MINER_NFT: '0x...',
  AXIE_NFT: '0x...'
};

// Ronin Testnet (chainId: 2021)
CONTRACT_ADDRESSES[2021] = {
  // ... testnet addresses
};
```

**Estructura:**
```typescript
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [chainId]: {
    // Game contracts
    MINING_POOL: Address;
    FORGE_FACTORY: Address;
    MINER_STATS_MANAGER: Address;
    
    // NFT contracts
    GEODE_NFT: Address;
    CORE_MINER_NFT: Address;
    AXIE_NFT: Address;
    MEMENTO_NFT: Address;
  }
};
```

---

### **💎 Token Addresses (`tokens.ts`)**

Addresses de tokens ERC20 usados en el juego.

```typescript
import { TOKEN_ADDRESSES } from '@/lib/config/tokens';

const axsAddress = TOKEN_ADDRESSES.AXS;
const slpAddress = TOKEN_ADDRESSES.SLP;
const coreAddress = TOKEN_ADDRESSES.FCORE;
const mementoAddress = TOKEN_ADDRESSES.MEMENTO;
```

**Disponibles:**
```typescript
export const TOKEN_ADDRESSES = {
  AXS: '0x...' as Address,      // Axie Infinity Shard
  SLP: '0x...' as Address,      // Smooth Love Potion
  WETH: '0x...' as Address,     // Wrapped ETH
  RON: '0x...' as Address,      // Ronin
  USDC: '0x...' as Address,     // USD Coin
  FCORE: '0x...' as Address,    // Forged Core (reward token)
  MEMENTO: '0x...' as Address,  // Memento NFT
};
```

**Con metadata:**
```typescript
export const TOKEN_CONFIG = {
  AXS: {
    address: TOKEN_ADDRESSES.AXS,
    symbol: 'AXS',
    decimals: 18,
    name: 'Axie Infinity Shard'
  },
  SLP: {
    address: TOKEN_ADDRESSES.SLP,
    symbol: 'SLP',
    decimals: 0,
    name: 'Smooth Love Potion'
  },
  // ...
};
```

---

## 🎯 Uso

### **En Services**
```typescript
import { TOKEN_ADDRESSES } from '@/lib/config/tokens';
import { CONTRACT_ADDRESSES } from '@/lib/config/contracts';

export class ForgeTokenService {
  async getBalances(userAddress: Address, chainId: number) {
    // Usa addresses de config
    const axsBalance = await this.getBalance(
      TOKEN_ADDRESSES.AXS,
      userAddress
    );
    
    const forgeAddress = CONTRACT_ADDRESSES[chainId].FORGE_FACTORY;
    const approval = await this.checkApproval(
      TOKEN_ADDRESSES.AXS,
      userAddress,
      forgeAddress
    );
  }
}
```

### **En Hooks**
```typescript
import { TOKEN_ADDRESSES } from '@/lib/config/tokens';

export function useTokenBalances() {
  const { address, chain } = useAccount();
  
  const tokens = [
    { address: TOKEN_ADDRESSES.AXS, symbol: 'AXS' },
    { address: TOKEN_ADDRESSES.SLP, symbol: 'SLP' },
    { address: TOKEN_ADDRESSES.MEMENTO, symbol: 'MEMENTO' }
  ];
  
  // ... fetch balances
}
```

### **En ContractManager**
```typescript
import { CONTRACT_ADDRESSES } from '@/lib/config/contracts';

export class ContractManager {
  getMiningPool(): IMiningContract {
    const address = CONTRACT_ADDRESSES[this.chainId].MINING_POOL;
    return MiningPoolFactory.create({ address, signerOrProvider: this.signer });
  }
}
```

---

## 🌐 Multi-Chain Support

### **Agregar Nueva Red**
```typescript
// contracts.ts
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // ... existing chains
  
  // Nueva red
  [5]: { // Goerli
    MINING_POOL: '0x...',
    FORGE_FACTORY: '0x...',
    // ... rest of contracts
  }
};
```

### **Detectar Red Actual**
```typescript
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/config/contracts';

function MyComponent() {
  const { chain } = useAccount();
  
  if (!chain || !CONTRACT_ADDRESSES[chain.id]) {
    return <UnsupportedNetwork />;
  }
  
  const contracts = CONTRACT_ADDRESSES[chain.id];
  // ... usar contracts
}
```

---

## ✅ Beneficios

### **1. Single Source of Truth**
- ✅ Cambiar address = 1 edit
- ✅ No más addresses hardcoded dispersos

### **2. Multi-Chain Ready**
- ✅ Soporte para múltiples redes
- ✅ Fácil migración de contratos

### **3. Type Safety**
```typescript
// ✅ Autocomplete de addresses
const address = CONTRACT_ADDRESSES[2020].MINING_POOL;
//                                       ^ Type-safe
```

### **4. Environment Aware**
```typescript
// Producción vs Development
const addresses = process.env.NODE_ENV === 'production'
  ? CONTRACT_ADDRESSES[2020] // Mainnet
  : CONTRACT_ADDRESSES[2021]; // Testnet
```

---

## 🔒 Seguridad

### **Validación de Addresses**
```typescript
import { isAddress } from 'viem';

// Validar en build time
Object.entries(CONTRACT_ADDRESSES).forEach(([chainId, contracts]) => {
  Object.entries(contracts).forEach(([name, address]) => {
    if (!isAddress(address)) {
      throw new Error(`Invalid address for ${name} on chain ${chainId}`);
    }
  });
});
```

### **Environment Variables (Opcional)**
```typescript
// .env.local
NEXT_PUBLIC_MINING_POOL_ADDRESS=0x...
NEXT_PUBLIC_FORGE_FACTORY_ADDRESS=0x...

// contracts.ts
export const CONTRACT_ADDRESSES = {
  [2020]: {
    MINING_POOL: (process.env.NEXT_PUBLIC_MINING_POOL_ADDRESS || '0x...') as Address,
    // ...
  }
};
```

---

## 🔄 Evolución

### **v1.0 - Antes**
- ❌ Addresses hardcoded en múltiples archivos
- ❌ Cambios requieren buscar/reemplazar
- ❌ Sin soporte multi-chain

### **v2.0 - Actual**
- ✅ Addresses centralizados por red
- ✅ Type-safe con TypeScript
- ✅ Multi-chain ready
- ✅ Fácil mantenimiento

---

## 📚 Archivos Relacionados

- [`/lib/contracts`](../contracts/README.md) - ContractManager que usa estos addresses
- [`/lib/constants`](../constants/README.md) - Constantes de gameplay
