# 🎮 Constants - Constantes del Juego

Configuración estática de gameplay: geodas, mementos, costos, tipos, etc.

---

## 📂 Estructura

```
constants/
├── geodes.ts           # Configuración de geodas y mementos
├── miners.ts           # Tipos y configuración de mineros
├── costs.ts            # Costos de operaciones
├── axieTypes.ts        # Tipos de Axies y clases
└── index.ts            # Barrel export
```

---

## 📖 Constantes Disponibles

### **1. Geodas** (`geodes.ts`)

#### **GEODE_COSTS** - Costos de Forja
```typescript
export const GEODE_COSTS = {
  [GeodeType.PETIT_BEAST]: {
    axs: 10,
    slp: 100,
    mementos: { [AxieClass.BEAST]: 5 }
  },
  [GeodeType.PETIT_AQUA]: {
    axs: 10,
    slp: 100,
    mementos: { [AxieClass.AQUA]: 5 }
  },
  // ... más tipos
};
```

#### **AXIE_CLASS_INFO** - Información de Clases
```typescript
export const AXIE_CLASS_INFO = {
  [AxieClass.BEAST]: {
    id: AxieClass.BEAST,
    name: 'Beast',
    displayName: 'Bestia',
    icon: '/images/mementos/memento-beast.webp',
    color: '#f59e0b',
  },
  [AxieClass.AQUA]: {
    id: AxieClass.AQUA,
    name: 'Aqua',
    displayName: 'Aqua',
    icon: '/images/mementos/memento-aqua.webp',
    color: '#3b82f6',
  },
  // ... 9 clases totales
};
```

#### **GEODE_HATCH_TIMES** - Tiempos de Eclosión
```typescript
export const GEODE_HATCH_TIMES = {
  [GeodeStage.PETIT]: 3600,      // 1 hora
  [GeodeStage.ALTO]: 7200,       // 2 horas
  [GeodeStage.ANIMAL]: 14400,    // 4 horas
  [GeodeStage.ULTRAMECH]: 28800, // 8 horas
  [GeodeStage.TANQUE]: 43200,    // 12 horas
};
```

---

### **2. Mineros** (`miners.ts`)

#### **MINER_STATS** - Estadísticas Base
```typescript
export const MINER_BASE_STATS = {
  [MinerType.PETIT]: {
    powerMin: 100,
    powerMax: 200,
    efficiencyMin: 80,
    efficiencyMax: 100,
  },
  // ... otros tipos
};
```

#### **MINER_NAMES** - Nombres de Mineros
```typescript
export const MINER_NAMES = {
  [MinerType.BEAST]: [
    'Agile Pup',
    'Shadow Beast',
    'Pack Leader',
    // ... 10 nombres por tipo
  ],
  [MinerType.AQUA]: [
    'Deep Diver',
    'Wave Rider',
    'Ocean Guardian',
    // ...
  ],
  // ... 9 tipos
};
```

---

### **3. Costos** (`costs.ts`)

#### **OPERATION_COSTS** - Costos de Operaciones
```typescript
export const OPERATION_COSTS = {
  FORGE_GEODE: {
    baseCost: 10, // AXS
    slpCost: 100,
  },
  HATCH_GEODE: {
    gasCost: 0.01, // RON
  },
  REPAIR_MINER: {
    costPercentage: 3, // % de producción mensual
  },
  FEED_VORACIOUS: {
    fcoreCost: 5,
  },
};
```

---

### **4. Tipos de Axies** (`axieTypes.ts`)

#### **AXIE_TYPE_BONUSES** - Bonuses por Tipo
```typescript
export const AXIE_TYPE_BONUSES = {
  [AxieType.BEAST]: {
    miningBonus: 1.1,
    specialAbility: 'Critical Strike',
  },
  [AxieType.AQUA]: {
    miningBonus: 1.05,
    specialAbility: 'Efficiency Boost',
  },
  // ... 9 tipos
};
```

---

## 🎯 Uso

### **En Componentes UI**
```typescript
import { AXIE_CLASS_INFO, GEODE_COSTS } from '@/lib/constants';

function ForgePanel() {
  const costs = GEODE_COSTS[GeodeType.PETIT_BEAST];
  
  return (
    <div>
      <h3>Costo de Forja</h3>
      <p>AXS: {costs.axs}</p>
      <p>SLP: {costs.slp}</p>
      
      {Object.entries(costs.mementos).map(([classId, amount]) => {
        const classInfo = AXIE_CLASS_INFO[Number(classId)];
        return (
          <div key={classId}>
            <img src={classInfo.icon} alt={classInfo.name} />
            <p>{classInfo.displayName}: {amount}</p>
          </div>
        );
      })}
    </div>
  );
}
```

### **En Services**
```typescript
import { GEODE_HATCH_TIMES, OPERATION_COSTS } from '@/lib/constants';

export class ForgeService {
  async canHatchGeode(geode: Geode): Promise<boolean> {
    const hatchTime = GEODE_HATCH_TIMES[geode.stage];
    const elapsed = Date.now() - geode.createdAt;
    return elapsed >= hatchTime;
  }
  
  calculateForgeCost(geodeType: GeodeType): TokenAmounts {
    return OPERATION_COSTS.FORGE_GEODE;
  }
}
```

### **En Utils**
```typescript
import { MINER_NAMES } from '@/lib/constants';

export function getMinerName(minerType: MinerType, nameIndex: number): string {
  const names = MINER_NAMES[minerType];
  return names[nameIndex] || names[0];
}
```

---

## ✅ Beneficios

### **1. Single Source of Truth**
- Cambiar balance de juego = 1 archivo
- No más magic numbers dispersos

### **2. Type Safety**
```typescript
// ✅ Type-safe access
const cost = GEODE_COSTS[GeodeType.PETIT_BEAST];
//            ^ Autocomplete de tipos válidos
```

### **3. Fácil Balance**
```typescript
// Ajustar costos de todas las geodas PETIT
Object.keys(GEODE_COSTS)
  .filter(key => key.startsWith('PETIT'))
  .forEach(key => {
    GEODE_COSTS[key].axs *= 1.1; // +10% costo
  });
```

### **4. Internacionalización Ready**
```typescript
export const AXIE_CLASS_INFO = {
  [AxieClass.BEAST]: {
    name: 'Beast',           // Key para i18n
    displayName: t('axie.beast'), // Traducible
  },
};
```

---

## 🔄 Evolución de Balance

### **Versionamiento de Constantes**
```typescript
// constants/v1/geodes.ts
export const GEODE_COSTS_V1 = { /* ... */ };

// constants/v2/geodes.ts
export const GEODE_COSTS_V2 = { /* ... costos ajustados */ };

// constants/geodes.ts
export const GEODE_COSTS = GEODE_COSTS_V2; // Usar última versión
```

### **Feature Flags**
```typescript
export const FEATURES = {
  VORACIOUS_MINERS: true,
  GEODE_FUSION: false, // Próximamente
  MINER_LEVELING: true,
};
```

---

## 🧪 Testing con Constantes

```typescript
import { GEODE_COSTS } from '@/lib/constants';

describe('Forge Costs', () => {
  it('should have costs for all geode types', () => {
    Object.values(GeodeType).forEach(type => {
      expect(GEODE_COSTS[type]).toBeDefined();
      expect(GEODE_COSTS[type].axs).toBeGreaterThan(0);
    });
  });
});
```

---

## 📚 Archivos Relacionados

- [`/lib/services`](../services/README.md) - Services que usan estas constantes
- [`/lib/utils`](../utils/README.md) - Utils que procesan constantes

---

**Última actualización:** 20 Enero 2026
