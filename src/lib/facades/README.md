# 🎭 Facades - Capa de Abstracción

Facades que simplifican operaciones complejas proporcionando una API unificada.

---

## 📂 Estructura

```
facades/
├── NFTFacade.ts           # Facade para operaciones con NFTs
├── InventoryFacade.ts     # Facade para inventario y geodas
└── README.md
```

---

## 🎯 Patrón Facade

El patrón **Facade** proporciona una interfaz simplificada a un subsistema complejo.

### **Problema que Resuelve**
```typescript
// ❌ SIN FACADE - Complejo y repetitivo
const contractManager = ContractManager.getInstance();
const minerContract = contractManager.getCoreMinerNFT();
const balance = await minerContract.balanceOf(address);
const tokenIds: bigint[] = [];
for (let i = 0; i < Number(balance); i++) {
  const tokenId = await minerContract.tokenOfOwnerByIndex(address, BigInt(i));
  tokenIds.push(tokenId);
}
const miners = await Promise.all(
  tokenIds.map(async (tokenId) => {
    const minerData = await minerContract.getMinerData(tokenId);
    // ... transformar datos
    return transformedMiner;
  })
);
```

### **Solución con Facade**
```typescript
// ✅ CON FACADE - Simple y limpio
const nftFacade = new NFTFacade(contractManager);
const miners = await nftFacade.getMinersFromWallet(address);
```

---

## 📖 Facades Disponibles

### **1. NFTFacade** - Gestión de NFTs

**Propósito:** Unificar acceso a Core Miners y Axies NFT.

```typescript
import { NFTFacade } from '@/lib/facades/NFTFacade';

const nftFacade = new NFTFacade(contractManager);

// Obtener todos los Core Miners del usuario
const miners = await nftFacade.getMinersFromWallet(address);

// Obtener todos los Axies del usuario
const axies = await nftFacade.getAxiesFromWallet(address);
```

**Características:**
- ✅ Carga batch de NFTs
- ✅ Transformación de datos on-chain a UI
- ✅ Obtención de metadata
- ✅ Mapeo de tipos (minerType → stage, axieType)
- ✅ Cálculo de rareza

**Retorna:**
```typescript
interface CoreMinerNFT {
  tokenId: bigint;
  name: string;
  stage: GeodeStage;
  axieType: AxieType;
  rarity: Rarity;
  miningPower: number;
  efficiency: number;
  durability: bigint;
  level: bigint;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}
```

---

### **2. InventoryFacade** - Gestión de Inventario

**Propósito:** Simplificar consultas de geodas y NFTs del usuario.

```typescript
import { InventoryFacade } from '@/lib/facades/InventoryFacade';

const inventoryFacade = new InventoryFacade(contractManager);

// Obtener todas las geodas del usuario
const geodes = await inventoryFacade.getUserGeodes(userAddress);

// Obtener geodas filtrando por estado
const readyToHatch = geodes.filter(g => g.canHatch);

// Obtener información de una geoda específica
const geodeInfo = await inventoryFacade.getGeodeInfo(geodeId);
```

**Características:**
- ✅ Consulta de geodas propias
- ✅ Verificación de estado de eclosión
- ✅ Histórico de eventos (forjado, eclosionado)
- ✅ Cálculo de tiempo restante

**Retorna:**
```typescript
interface GeodeInfo {
  tokenId: bigint;
  owner: Address;
  stage: GeodeStage;
  axieType: AxieType;
  createdAt: number;
  hatchTime: number;
  canHatch: boolean;
  timeRemaining: number;
}
```

---

## 🔧 Uso en Hooks

### **Con NFTFacade**
```typescript
import { useNFTFacade } from '@/lib/hooks';

function InventoryPage() {
  const nftFacade = useNFTFacade();
  const { address } = useAccount();
  
  const [miners, setMiners] = useState<CoreMinerNFT[]>([]);
  
  useEffect(() => {
    async function loadMiners() {
      if (!address) return;
      const loaded = await nftFacade.getMinersFromWallet(address);
      setMiners(loaded);
    }
    loadMiners();
  }, [address, nftFacade]);
  
  return <MinerGrid miners={miners} />;
}
```

### **Con InventoryFacade**
```typescript
import { useInventoryFacade } from '@/lib/hooks';

function GeodeList() {
  const inventoryFacade = useInventoryFacade();
  const { address } = useAccount();
  
  const [geodes, setGeodes] = useState<GeodeInfo[]>([]);
  
  useEffect(() => {
    async function loadGeodes() {
      if (!address) return;
      const loaded = await inventoryFacade.getUserGeodes(address);
      setGeodes(loaded);
    }
    loadGeodes();
  }, [address, inventoryFacade]);
  
  return <GeodeGrid geodes={geodes} />;
}
```

---

## 🏗️ Estructura Interna

### **Dependency Injection**
```typescript
export class NFTFacade {
  constructor(private contractManager: ContractManager) {}
  
  async getMinersFromWallet(address: Address): Promise<CoreMinerNFT[]> {
    // Usa contractManager para obtener contratos
    const minerContract = this.contractManager.getCoreMinerNFT();
    // ... lógica
  }
}
```

**Beneficios:**
- ✅ Testeable (mock de ContractManager)
- ✅ No acoplado a implementación
- ✅ Sigue Dependency Inversion Principle

---

## ✅ Beneficios

### **1. Simplicidad**
Reduce código repetitivo de 50+ líneas a 1-2 líneas.

### **2. Reutilización**
Un facade → Usado por múltiples hooks/componentes.

### **3. Mantenibilidad**
Cambios en lógica → Un solo lugar (facade).

### **4. Testing**
Fácil mock del facade completo.

### **5. Type Safety**
Retorna tipos bien definidos (no any).

---

## 📊 Comparativa

| Aspecto | Sin Facade | Con Facade |
|---------|------------|------------|
| **LOC en componentes** | 50+ líneas | 2-3 líneas |
| **Duplicación de código** | Alta | Ninguna |
| **Testing** | Difícil | Fácil |
| **Type Safety** | Manual | Automático |
| **Mantenibilidad** | Baja | Alta |

---

## 🧪 Testing

```typescript
// Mock del facade
const mockNFTFacade = {
  getMinersFromWallet: jest.fn().mockResolvedValue([
    { tokenId: 1n, name: 'Test Miner', /* ... */ }
  ])
};

// Test de hook
it('should load miners', async () => {
  const { result } = renderHook(() => useNFTs(), {
    wrapper: ({ children }) => (
      <NFTFacadeContext.Provider value={mockNFTFacade}>
        {children}
      </NFTFacadeContext.Provider>
    )
  });
  
  await waitFor(() => {
    expect(result.current.miners).toHaveLength(1);
  });
});
```

---

## 🔄 Evolución

### **Agregar Nuevo Facade**

1. **Crear archivo:**
```typescript
// ForgeStatusFacade.ts
export class ForgeStatusFacade {
  constructor(private contractManager: ContractManager) {}
  
  async getForgeStatus(userAddress: Address) {
    // Lógica unificada
  }
}
```

2. **Crear hook:**
```typescript
// useForgeSt atusFacade.ts
export function useForgeStatusFacade() {
  const contractManager = useContractManager();
  return useMemo(() => new ForgeStatusFacade(contractManager), [contractManager]);
}
```

3. **Usar en componentes:**
```typescript
const forgeStatusFacade = useForgeStatusFacade();
const status = await forgeStatusFacade.getForgeStatus(address);
```

---

## 📚 Archivos Relacionados

- [`/lib/hooks`](../hooks/README.md) - Hooks que usan facades
- [`/lib/contracts`](../contracts/README.md) - ContractManager
- [`/lib/services`](../services/README.md) - Services especializados

---

**Última actualización:** 20 Enero 2026
