# 📱 App - Next.js Pages (App Router)

Páginas y rutas de la aplicación usando Next.js 16 App Router.

---

## 📂 Estructura de Rutas

```
app/
├── layout.tsx                    # Layout principal de la app
├── page.tsx                      # Homepage (/)
│
├── dashboard/
│   └── page.tsx                  # Dashboard principal (/dashboard)
│
├── staking/
│   └── page.tsx                  # Staking de miners (/staking)
│
├── forge/
│   └── page.tsx                  # Sistema de forja (/forge)
│
├── inventory/
│   └── page.tsx                  # Inventario de NFTs (/inventory)
│
├── economy/
│   └── page.tsx                  # ✨ Métricas económicas (/economy)
│
└── admin/
    └── recipes/
        └── page.tsx              # ✨ Admin de recetas (/admin/recipes)
```

---

## 🏠 Páginas Principales

### `/` - Homepage
Landing page del proyecto con información general.

---

### `/dashboard` - Dashboard Principal

Dashboard completo del usuario con todas las features integradas.

**Componentes Integrados:**
- ✅ Wallet info
- ✅ TokenPriceCard (Fase 13)
- ✅ Stats cards (miners, axies, balance)
- ✅ CycleCard (si hay ciclos activos)
- ✅ fCoreBalanceCard (si tiene fCORE)
- ✅ CollectionProgressCard (Fase 14)
- ✅ Tabs: Overview, Miners, Stats

**Tabs:**
1. **Overview** - Resumen general
2. **Miners** - Grid de CoreMiners con stats
3. **Estadísticas** - MinerStatsHistory y comparación

**Features:**
- Auto-refresh de datos
- Responsive grid layout
- Loading states
- Error handling

---

### `/staking` - Staking Page

Página para stakear CoreMiners en minería.

**Features:**
- Lista de miners disponibles
- Miners activos en minería
- Start/Stop mining
- Claim rewards
- Pending rewards display

---

### `/forge` - Forge Page

Sistema completo de forja de geodas.

**Features:**
- Selector de categoría y clase
- Balance de tokens necesarios
- Approve automático
- Forja de geodas
- Eclosión de geodas

---

### `/inventory` - Inventory Page

Inventario completo de NFTs del usuario.

**Features:**
- Grid de CoreMiners
- Grid de Geodas
- Grid de Axies (si tiene)
- Filtros por tipo
- Búsqueda

---

### ✨ `/economy` - Economy Page (Fase 13)

**Nueva página** con métricas económicas del ecosistema.

**Componentes:**
- `HalvingCountdown` - Countdown para próximo halving
- `TokenPriceCard` - Precio de CORE (full)
- `TokenConverterWidget` - Conversor CORE ↔ RON
- `BuyBackDashboard` - Métricas del fondo
- `EmissionScheduleCard` - Schedule de emisión

**Secciones:**
1. **Header** - Título y descripción
2. **Price & Converter** - Precio y conversión
3. **BuyBack Fund** - Métricas de recompra
4. **Emission** - Schedule y halving
5. **Stats** - Métricas generales

**Features:**
- Auto-refresh cada 30s
- Gráficos interactivos
- Métricas en tiempo real

---

### ✨ `/admin/recipes` - Recipe Admin (Fase 12)

**Nueva página** para administración de recetas (solo admin).

**Componentes:**
- `RecipeManagerTable` - Tabla CRUD completa
- `AddRecipeModal` - Modal para crear recetas

**Features:**
- Verificación de rol admin
- CRUD completo de recetas
- Toggle activar/desactivar
- Filtros (todas, activas, inactivas)
- Stats summary
- Refresh manual

**Permisos:**
- Solo accesible con rol `DEFAULT_ADMIN_ROLE`
- Redirect si no tiene permisos

---

## 🎨 Layout Principal

### `layout.tsx`

Layout compartido por todas las páginas.

**Features:**
- Header con wallet connection
- Navigation menu
- Footer
- Web3Provider wrapper
- Toast notifications

---

## 🔀 Navegación

### Menu Principal

```tsx
Navigation
├── Dashboard        (/dashboard)
├── Staking          (/staking)
├── Forge            (/forge)
├── Inventory        (/inventory)
├── Economy          (/economy)        ✨ Nuevo
└── Admin            (/admin/recipes)  ✨ Nuevo (solo admin)
```

---

## 📊 Integración de Componentes por Página

### Dashboard
```tsx
import { TokenPriceCard } from '@/components/price';
import { CollectionProgressCard } from '@/components/collection';
import { fCoreBalanceCard } from '@/components/fcore';
import { MinerStatsHistoryCard } from '@/components/minerstats';

// Integrados en tabs y sections
```

### Economy
```tsx
import { HalvingCountdown } from '@/components/emission';
import { TokenPriceCard, TokenConverterWidget } from '@/components/price';
import { BuyBackDashboard } from '@/components/buyback';
import { EmissionScheduleCard } from '@/components/emission';
```

### Admin/Recipes
```tsx
import { RecipeManagerTable, AddRecipeModal } from '@/components/recipe';
import { useRecipes, useAdminRole } from '@/lib/hooks';
```

---

## 🎯 Patrón de Página Estándar

Todas las páginas siguen este patrón:

```tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Card, Loading } from '@/components/ui';

export default function PageName() {
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');

  // Wallet check
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-400">
            Por favor conecta tu wallet
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <p className="text-gray-400">Description</p>
      </section>

      {/* Content */}
      <section>
        {/* Components */}
      </section>
    </div>
  );
}
```

---

## 🚀 Nuevas Páginas Implementadas

### Fase 13 - Economy Page
- ✅ Ruta: `/economy`
- ✅ Componentes: 5 integrados
- ✅ Auto-refresh: Sí
- ✅ Responsive: Sí

### Fase 12 - Admin Recipes Page
- ✅ Ruta: `/admin/recipes`
- ✅ Componentes: 2 integrados
- ✅ Auth check: Sí (rol admin)
- ✅ CRUD completo: Sí

---

## 📊 Estadísticas

**Total de Páginas:** 7  
**Páginas Públicas:** 6  
**Páginas Admin:** 1  
**Componentes por Página:** 3-5 promedio

| Página | Componentes | Estado |
|--------|-------------|--------|
| Dashboard | 8+ | ✅ |
| Staking | 5+ | ✅ |
| Forge | 4+ | ✅ |
| Inventory | 3+ | ✅ |
| **Economy** | **5** | ✅ Fase 13 |
| **Admin/Recipes** | **2** | ✅ Fase 12 |

---

## 🔐 Rutas Protegidas

### Admin Routes
```tsx
// /admin/recipes - Solo admin
if (!isAdmin) {
  return <Redirect to="/dashboard" />;
}
```

### Auth Routes
```tsx
// Todas las rutas requieren wallet conectado
if (!isConnected) {
  return <ConnectWalletPrompt />;
}
```

---

## 📚 Archivos Relacionados

- [`/components`](../components/README.md) - Componentes usados en páginas
- [`/lib/hooks`](../lib/hooks/README.md) - Hooks usados en páginas
- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Arquitectura completa

---

## 🎉 Estado Actual

**Proyecto:** 100% Completado  
**Páginas Implementadas:** 7/7  
**Rutas Activas:** 7  
**Última actualización:** 21 Enero 2026

### Páginas Nuevas (Fases 11-14)

- ✅ **Fase 12:** `/admin/recipes` - Panel admin de recetas
- ✅ **Fase 13:** `/economy` - Métricas económicas
- ✅ **Integración:** CollectionProgressCard en `/dashboard` (Fase 14)
- ✅ **Integración:** MinerStatsHistory en `/dashboard` (Fase 11)

**Todas las páginas usan Next.js 16 App Router con 'use client' y están optimizadas para SSR.**
