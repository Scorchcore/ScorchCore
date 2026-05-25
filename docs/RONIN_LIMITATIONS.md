# ⚠️ Limitaciones de Ronin Testnet

> **📌 NOTA (Enero 2026):** El batching (Solución 1) ya está **implementado y funcional** en `InventoryFacade.ts`. 
> Este documento se mantiene como referencia del problema y posibles mejoras futuras.

## 🚫 **Límite de Bloques en eth_getLogs**

### **Error:**
```
invalid param: invalid getLogs request, cannot get more than 500 blocks
```

### **Causa:**
Ronin Testnet (Saigon) limita las queries de eventos a máximo **500 bloques** por solicitud.

---

## 📊 **Impacto en el Inventario**

### **Configuración Actual:**
```typescript
const currentBlock = await provider.getBlockNumber();
const fromBlock = Math.max(0, currentBlock - 500); // ✅ 500 bloques

const forgedEvents = await transmuterContract.queryFilter(
  transmuterContract.filters.GeodeForged(address),
  fromBlock,
  'latest'
);
```

### **Qué significa:**

| Concepto | Valor | Tiempo Aprox |
|----------|-------|--------------|
| **Bloques por query** | 500 | - |
| **Tiempo por bloque** | ~3 segundos | - |
| **Rango de tiempo** | 500 × 3s | **~25 minutos** |

**Conclusión:** El inventario solo mostrará geodas forjadas en los **últimos 25 minutos**.

---

## ⚠️ **Limitación Actual**

### **Problema:**
Si forjaste una geoda hace **más de 25 minutos**, no aparecerá en el inventario.

### **Por qué:**
Solo buscamos en los últimos 500 bloques para cumplir con el límite de Ronin.

---

## ✅ **Soluciones**

### **Solución 1: Batching (RECOMENDADO PARA PRODUCCIÓN)**

Dividir la búsqueda en múltiples queries de 500 bloques:

```typescript
async function getAllGeodeEvents(
  contract: Contract,
  userAddress: string,
  provider: Provider
): Promise<Event[]> {
  const currentBlock = await provider.getBlockNumber();
  const BATCH_SIZE = 500; // Límite de Ronin
  const TOTAL_BLOCKS = 50000; // Buscar últimos ~50k bloques (varios días)
  
  const allEvents: Event[] = [];
  
  // Dividir en batches de 500 bloques
  for (let i = 0; i < TOTAL_BLOCKS; i += BATCH_SIZE) {
    const fromBlock = Math.max(0, currentBlock - TOTAL_BLOCKS + i);
    const toBlock = Math.min(currentBlock, fromBlock + BATCH_SIZE);
    
    if (fromBlock >= toBlock) break;
    
    try {
      const events = await contract.queryFilter(
        contract.filters.GeodeForged(userAddress),
        fromBlock,
        toBlock
      );
      
      allEvents.push(...events);
    } catch (error) {
      console.warn(`Failed to fetch events for blocks ${fromBlock}-${toBlock}`);
    }
    
    // Delay opcional para no saturar RPC
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return allEvents;
}
```

**Ventajas:**
- ✅ Cubre más bloques históricos
- ✅ Encuentra todas las geodas del usuario
- ✅ Respeta límite de 500 bloques

**Desventajas:**
- ⏱️ Más lento (múltiples requests)
- 🔄 Más carga en RPC

---

### **Solución 2: Indexer/Subgraph (MEJOR PARA MAINNET)**

Usar un servicio de indexado que guarde todos los eventos:

```typescript
// Opción A: The Graph
const query = `
  {
    geodesForgeds(where: { owner: "${userAddress}" }) {
      id
      geodeType
      tokenId
      timestamp
    }
  }
`;

// Opción B: Base de datos propia
// Backend indexa eventos y los guarda en DB
const response = await fetch('/api/user/geodes?address=' + userAddress);
```

**Ventajas:**
- ✅ Instantáneo
- ✅ Sin límites de bloques
- ✅ Queries complejas
- ✅ Historial completo

**Desventajas:**
- 💰 Requiere infraestructura adicional
- 🏗️ Setup más complejo

---

### **Solución 3: Cache Local (HÍBRIDO)**

Guardar geodas en localStorage cuando se forjan:

```typescript
// Cuando se forja una geoda
const { tx, geodeId } = await forgeService.forgeGeode(geodeType);

// Guardar en cache local
const cachedGeodes = JSON.parse(localStorage.getItem('myGeodes') || '[]');
cachedGeodes.push({
  id: geodeId.toString(),
  geodeType,
  timestamp: Date.now(),
  txHash: tx.hash
});
localStorage.setItem('myGeodes', JSON.stringify(cachedGeodes));

// Al cargar inventario, combinar cache + blockchain
const cachedGeodes = getCachedGeodes();
const recentGeodes = await getGeodesFromBlockchain(); // Últimos 500 bloques
const allGeodes = mergeDeduplicated(cachedGeodes, recentGeodes);
```

**Ventajas:**
- ✅ Rápido y simple
- ✅ No requiere backend
- ✅ Funciona offline para datos locales

**Desventajas:**
- ⚠️ Solo funciona en mismo navegador
- ⚠️ Se pierde si borras localStorage
- ⚠️ No sincroniza entre dispositivos

---

## 🎯 **Recomendaciones por Etapa**

### **Testnet Actual (Ahora):**
```
✅ Usar 500 bloques simple
- Suficiente para pruebas
- Forjas recientes se ven bien
- Rápido y confiable
```

### **Beta/Testnet Avanzada:**
```
✅ Implementar Batching
- Cubrir más historia
- Mejor UX
- Preparar para producción
```

### **Mainnet/Producción:**
```
✅ Usar Indexer (The Graph o propio)
+ Cache local como fallback
- Performance óptima
- Historial completo
- Queries avanzadas
```

---

## 💡 **Implementación Recomendada**

### **Fase 1 (Actual):** ✅
```typescript
// Simple - 500 bloques
const fromBlock = currentBlock - 500;
```

### **Fase 2 (Mejora):**
```typescript
// Batching - 10,000 bloques (varios días)
const allEvents = await getAllEventsWithBatching(
  contract,
  address,
  10000 // ~8 horas de historia
);
```

### **Fase 3 (Producción):**
```typescript
// Indexer + Cache
const geodes = await fetchFromIndexer(address);
if (!geodes.length) {
  // Fallback a blockchain
  geodes = await getAllEventsWithBatching(contract, address);
}
```

---

## 📝 **Otras Limitaciones de Ronin**

### **1. fromBlock: "earliest" no soportado**
```javascript
// ❌ No funciona
queryFilter(filter, "earliest", "latest")

// ✅ Funciona
queryFilter(filter, currentBlock - 500, "latest")
```

### **2. Rate Limiting**
- Ronin RPC tiene límites de requests por segundo
- Recomendación: máximo 10 requests/segundo

### **3. Gas Price Mínimo**
- Ronin Testnet requiere mínimo 20 gwei
- Hardhat config debe tener `gasPrice: 25000000000`

---

## 🔗 **Referencias**

- **Ronin Docs:** https://docs.roninchain.com/
- **Ethers.js QueryFilter:** https://docs.ethers.org/v6/api/contract/#Contract-queryFilter
- **The Graph:** https://thegraph.com/docs/

---

## ✅ **Estado Actual (Actualizado: Enero 2026)**

```
Inventario: ✅ BATCHING IMPLEMENTADO (Solución 1)
- ✅ Busca en últimos 10,000 bloques (~8 horas de historia)
- ✅ Usa chunks de 499 bloques con retry logic
- ✅ Método searchForgedEventsInChunks en InventoryFacade.ts
- ✅ Cubre casos de uso de testnet y early mainnet
- 🔜 Para escalar: considerar Indexer (Solución 2)
```

**Implementación actual en `InventoryFacade.ts`:**
```typescript
// Líneas 65-79
const totalBlocksToSearch = 10000; // ~8 horas
const chunkSize = 499; // Menor a 500 para seguridad
const startBlock = Math.max(0, currentBlock - totalBlocksToSearch);

const allForgedEvents = await this.searchForgedEventsInChunks(
  forgeContract,
  userAddress,
  startBlock,
  currentBlock,
  chunkSize
);
```

**Estado:** ✅ Fase 2 completada - Batching funcional en producción
