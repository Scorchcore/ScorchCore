# 🎨 Components - UI Components Library

Biblioteca completa de componentes React para ScorchCore.

---

## 📂 Estructura

```
components/
├── ui/                      # Componentes base reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
│
├── features/                # Componentes por feature (legacy)
│   └── forge/
│
├── minerstats/             # ✨ Fase 11 - Estadísticas de miners
│   ├── MinerStatsHistoryCard.tsx
│   ├── MinerPerformanceChart.tsx
│   └── MinerComparisonTable.tsx
│
├── recipe/                 # ✨ Fase 12 - Admin de recetas
│   ├── RecipeManagerTable.tsx
│   └── AddRecipeModal.tsx
│
├── price/                  # ✨ Fase 13 - Price Oracle
│   ├── TokenPriceCard.tsx
│   └── TokenConverterWidget.tsx
│
├── collection/             # ✨ Fase 14 - Collection/Set Bonuses
│   ├── CollectionProgressCard.tsx
│   └── SetBonusIndicator.tsx
│
├── emission/               # Fase 10 - Emission Schedule
│   ├── EmissionScheduleCard.tsx
│   └── HalvingCountdown.tsx
│
├── buyback/                # Fase 6 - BuyBack Fund
│   └── BuyBackDashboard.tsx
│
├── vesting/                # Fase 10 - Vesting Manager
│   └── VestingScheduleCard.tsx
│
├── fcore/                  # Fase 3 - fCORE System
│   ├── fCoreBalanceCard.tsx
│   ├── PohVerificationBanner.tsx
│   └── fCoreExplanationModal.tsx
│
├── cycle/                  # Fase 2 - Cycle System
│   ├── CycleCard.tsx
│   └── MinerLockedIndicator.tsx
│
├── axie/                   # Fase 1 - Axie Staking
│   └── AxieCard.tsx
│
└── trust/                  # Fase 4 - Trust Score
    └── TrustScoreBadge.tsx
```

---

## 🎯 Componentes por Categoría

### **UI Base (8 componentes)**

Componentes reutilizables del design system.

| Componente | Propósito | Variantes |
|------------|-----------|-----------|
| `Button` | Botones de acción | primary, secondary, outline |
| `Card` | Contenedor con estilo | default, gradient |
| `Badge` | Etiquetas de estado | success, warning, error, default |
| `Modal` | Diálogos modales | - |
| `Loading` | Indicadores de carga | sm, md, lg |
| `Toast` | Notificaciones | success, error, info |
| `Input` | Campos de entrada | text, number |
| `Select` | Select dropdowns | - |

**Uso:**
```tsx
import { Button, Card, Badge } from '@/components/ui';

<Card variant="gradient">
  <Badge variant="success">Active</Badge>
  <Button variant="primary">Action</Button>
</Card>
```

---

### **✨ Miner Stats (Fase 11) - 3 componentes**

Componentes para visualizar estadísticas e historial de miners.

#### `MinerStatsHistoryCard`
Card completo con salud, durabilidad, eficiencia y warnings.

```tsx
import { MinerStatsHistoryCard } from '@/components/minerstats';

<MinerStatsHistoryCard 
  stats={minerStats}
  health={healthScore}
/>
```

**Props:**
- `stats: MinerStatsUI` - Estadísticas del miner
- `health: HealthScore` - Score de salud (0-100)
- `className?: string`

#### `MinerPerformanceChart`
Gráfico de performance del miner.

#### `MinerComparisonTable`
Tabla para comparar múltiples miners.

---

### **✨ Recipe Admin (Fase 12) - 2 componentes**

Panel de administración para gestionar recetas de forja.

#### `RecipeManagerTable`
Tabla completa con CRUD de recetas.

```tsx
import { RecipeManagerTable } from '@/components/recipe';

<RecipeManagerTable 
  recipes={recipes}
  onToggle={handleToggle}
  onRefresh={refresh}
  isLoading={isLoading}
/>
```

**Props:**
- `recipes: RecipeInfo[]` - Lista de recetas
- `onToggle: (recipe) => Promise<void>` - Toggle activar/desactivar
- `onRefresh: () => Promise<void>` - Refrescar lista
- `isLoading?: boolean` - Estado de carga

**Features:**
- Filtros (todas, activas, inactivas)
- Toggle status con confirmación
- Botón de refresh
- Stats summary

#### `AddRecipeModal`
Modal para crear nuevas recetas (admin).

---

### **✨ Price Oracle (Fase 13) - 2 componentes**

Componentes para mostrar precio y conversión de tokens.

#### `TokenPriceCard`
Card con precio de CORE y estadísticas.

```tsx
import { TokenPriceCard } from '@/components/price';

<TokenPriceCard 
  variant="default"
  showStats={true}
/>
```

**Props:**
- `variant?: 'default' | 'compact'` - Tamaño del card
- `showStats?: boolean` - Mostrar estadísticas adicionales

**Features:**
- Precio en tiempo real
- Badge Fresh/Stale
- Auto-refresh cada 30s
- Stats: age, 24h change

#### `TokenConverterWidget`
Widget para convertir CORE ↔ RON.

```tsx
import { TokenConverterWidget } from '@/components/price';

<TokenConverterWidget />
```

**Features:**
- Input numérico
- Conversión bidireccional
- Cálculo en tiempo real
- Precio de referencia

---

### **✨ Collection/Set Bonuses (Fase 14) - 2 componentes**

Sistema de progreso de sets y bonuses.

#### `CollectionProgressCard`
Card con progreso de todos los sets.

```tsx
import { CollectionProgressCard } from '@/components/collection';

<CollectionProgressCard variant="default" />
```

**Props:**
- `variant?: 'default' | 'compact'`

**Features:**
- Progreso de 3 sets
- Progress bars dinámicos
- Requisitos detallados
- Bonus total acumulativo
- Próximo set indicator

**Sets:**
- 🌙 Cazador Nocturno (+1.50%)
- 🌊 Ecosistema Acuático (+2.00%)
- ⚙️ Maquinaria Avanzada (+1.50%)

#### `SetBonusIndicator`
Badge compacto de bonuses activos.

```tsx
import { SetBonusIndicator } from '@/components/collection';

<SetBonusIndicator 
  variant="default"
  showDetails={true}
/>
```

**Props:**
- `variant?: 'default' | 'minimal'`
- `showDetails?: boolean` - Mostrar detalles de cada set

---

### **Emission Schedule (Fase 10) - 2 componentes**

Visualización de schedule de emisión.

#### `EmissionScheduleCard`
Card con métricas de emisión.

#### `HalvingCountdown`
Countdown para próximo halving.

---

### **BuyBack Fund (Fase 6) - 1 componente**

Dashboard del fondo de recompra.

#### `BuyBackDashboard`
Dashboard completo con métricas del fondo.

---

### **Vesting (Fase 10) - 1 componente**

Gestión de vesting schedules.

#### `VestingScheduleCard`
Card con schedules activos y timeline.

---

### **fCORE System (Fase 3) - 3 componentes**

Sistema de conversión fCORE.

#### `fCoreBalanceCard`
Card con balance y conversión.

#### `PohVerificationBanner`
Banner de verificación PoH.

#### `fCoreExplanationModal`
Modal explicativo del sistema fCORE.

---

### **Cycle System (Fase 2) - 2 componentes**

Sistema de ciclos de minería.

#### `CycleCard`
Card de ciclo con bonuses.

#### `MinerLockedIndicator`
Indicador de miner bloqueado en ciclo.

---

### **Axie Staking (Fase 1) - 1 componente**

Staking de Axies NFT.

#### `AxieCard`
Card de Axie con opciones de stake/unstake.

---

### **Trust Score (Fase 4) - 1 componente**

Sistema de trust score.

#### `TrustScoreBadge`
Badge con score de confianza.

---

## 🎨 Patrón de Componente Estándar

Todos los componentes siguen este patrón:

```tsx
/**
 * ComponentName
 * 
 * Descripción breve
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Card, Badge, Loading } from '@/components/ui';
import { useHook } from '@/lib/hooks';

export interface ComponentNameProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ComponentName({
  variant = 'default',
  className = '',
}: ComponentNameProps) {
  const { data, isLoading, error } = useHook();

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <Loading size="md" text="Cargando..." />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error</div>
          <div className="text-sm text-gray-400">
            {error.message}
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!data) {
    return (
      <Card className={className}>
        <div className="text-center text-gray-400">
          Sin datos disponibles
        </div>
      </Card>
    );
  }

  // Main render
  return (
    <Card className={className}>
      {/* Content */}
    </Card>
  );
}
```

---

## 🎯 Principios de Diseño

### **1. Presentation Components**
Componentes puros de UI, sin lógica de negocio.

```tsx
// ✅ BIEN - Solo presentación
export function Component({ data, onAction }) {
  return <div onClick={onAction}>{data.value}</div>;
}

// ❌ MAL - Lógica de negocio en componente
export function Component() {
  const contract = getContract();
  const data = await contract.getData(); // ❌
  return <div>{data}</div>;
}
```

### **2. Separation of Concerns**
- Hooks → Datos y lógica
- Components → UI y presentación
- Services → Business logic

### **3. Consistent States**
Todos los componentes manejan:
- Loading state
- Error state
- Empty state
- Success state

### **4. Variants**
Componentes soportan variantes:
- `default` - Tamaño completo
- `compact` - Versión compacta

---

## 📊 Estadísticas

**Total de Componentes:** 40+

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| UI Base | 8 | ✅ |
| **Fase 11 (MinerStats)** | **3** | ✅ |
| **Fase 12 (Recipe)** | **2** | ✅ |
| **Fase 13 (Price)** | **2** | ✅ |
| **Fase 14 (Collection)** | **2** | ✅ |
| Emission | 2 | ✅ |
| BuyBack | 1 | ✅ |
| Vesting | 1 | ✅ |
| fCORE | 3 | ✅ |
| Cycle | 2 | ✅ |
| Axie | 1 | ✅ |
| Trust | 1 | ✅ |
| Otros | 12 | ✅ |

---

## 📚 Archivos Relacionados

- [`/lib/hooks`](../lib/hooks/README.md) - Hooks usados por componentes
- [`/components/ui`](./ui/README.md) - Componentes base
- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Arquitectura completa

---

## 🎉 Estado Actual

**Proyecto:** 100% Completado  
**Componentes Implementados:** 40+  
**Última actualización:** 21 Enero 2026

### Componentes Nuevos (Fases 11-14)

- ✅ **Fase 11:** MinerStatsHistoryCard + Charts + Comparison (3)
- ✅ **Fase 12:** RecipeManagerTable + AddRecipeModal (2)
- ✅ **Fase 13:** TokenPriceCard + TokenConverterWidget (2)
- ✅ **Fase 14:** CollectionProgressCard + SetBonusIndicator (2)

**Todos los componentes siguen el patrón estándar con loading/error/empty states y variantes.**
