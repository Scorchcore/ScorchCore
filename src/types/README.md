# 📁 Carpeta Types - Estado y Migración

## ✅ **MANTENER - Tipos de Dominio del Juego**

### **`game.ts`** - Tipos Core del Juego
```typescript
✅ GeodeStage, AxieType, Rarity, MinerType
✅ CoreMiner, Geode, MiningCycle, StakedAxie
✅ BurnTicket, ForgeCost, SetSynergy
```

**Razón:** Estos son tipos de dominio de negocio, NO tipos de contratos.
Son necesarios para la lógica de la aplicación.

**Usado en:**
- `services/nft/minerService.ts`
- `lib/hooks/useNFTs.ts`
- `lib/constants/coreminers.ts`
- `lib/constants/synergySets.ts`

---

### **`nftTypes.ts`** - Configuraciones de Geodas
```typescript
✅ GeodeType enum
✅ GeodeConfig interface
✅ GEODE_CONFIGS constants
```

**Razón:** Configuración estática del juego, incluye costos, drop rates, etc.
No está relacionado con la arquitectura de contratos.

---

### **`user.ts`** - Tipos de Usuario
```typescript
✅ UserProfile, UserInventory, UserBalances
✅ UserStats, UserActivity
```

**Razón:** Tipos de dominio para el manejo de usuarios en la UI.

---

## ⚠️ **DEPRECADO - Migrar a Nueva Arquitectura**

### **`contracts.ts`** - @deprecated
```typescript
❌ ContractAddresses  → Usar: src/lib/config/contracts.ts
❌ ContractConfig     → Usar: src/lib/contracts/factories/BaseContractFactory.ts
❌ ContractName       → Usar: src/lib/config/deployment.config.ts
❌ ContractEvent      → Crear en interfaces si es necesario
❌ WriteContractParams → Usar wagmi/viem directamente
❌ ReadContractParams  → Usar wagmi/viem directamente
```

**Estado:** Marcado como `@deprecated`
**Acción:** No eliminar aún, pero no usar en código nuevo.

---

### **`index.ts`** - Parcialmente Deprecado
```typescript
⚠️ export type Address → Usar: import type { Address } from 'viem'
✅ TokenBalance       → Mantener (tipo de UI)
✅ Transaction        → Mantener (tipo de UI)
✅ NetworkConfig      → Mantener (tipo de config)
```

---

## 🎯 **Plan de Acción**

### **Corto Plazo (Mantener)**
1. ✅ Mantener `game.ts` - Es dominio de negocio
2. ✅ Mantener `nftTypes.ts` - Configuración del juego
3. ✅ Mantener `user.ts` - Tipos de usuario
4. ⚠️ Deprecar `contracts.ts` - Ya tenemos en nueva arquitectura
5. ⚠️ Deprecar `Address` en `index.ts` - Usar viem

### **Largo Plazo (Cuando todo esté migrado)**
1. Eliminar `contracts.ts` completamente
2. Actualizar todos los imports de `Address` a usar viem
3. Mover tipos de UI (`TokenBalance`, etc.) a carpeta específica si crece

---

## 📝 **Resumen**

| Archivo | Estado | Acción |
|---------|--------|--------|
| `game.ts` | ✅ Mantener | Tipos de dominio necesarios |
| `nftTypes.ts` | ✅ Mantener | Configuración del juego |
| `user.ts` | ✅ Mantener | Tipos de usuario UI |
| `contracts.ts` | ⚠️ Deprecated | Usar nueva arquitectura |
| `index.ts` | ⚠️ Parcial | Deprecar Address, mantener resto |

**Conclusión:** NO ELIMINAR la carpeta `types`, pero consolidar gradualmente.
