# Frontend Actualizado - Sistema de Geodas con Categorías y Clases

## ✅ Cambios Completados

### 1. **Constantes y Helpers** (`src/lib/constants/geodes.ts`) ✅
Archivo nuevo con toda la configuración del sistema:

- **Enums**:
  - `GeodeCategory`: 5 categorías (PETIT, ALTO, ANIMAL, ULTRAMECH, TANQUE)
  - `AxieClass`: 9 clases de Axie (BEAST, AQUA, BIRD, REPTILE, BUG, PLANT, MECH, DUSK, DAWN)

- **Información Completa**:
  - `CATEGORY_INFO`: Datos de cada categoría (nombre, rareza, max supply, costos, fallo base, color)
  - `AXIE_CLASS_INFO`: Datos de cada clase (nombre, ícono, color)

- **Funciones Helper**:
  - `getGeodeName()`: Retorna nombre completo (ej: "Petit Bestia")
  - `getGeodeVideoPath()`: Retorna ruta al video según categoría y clase
  - `getMementoIcon()`: Retorna ícono del memento por clase
  - `isCategoryAvailable()`: Verifica si una categoría tiene assets (solo PETIT por ahora)

- **Listas para UI**:
  - `AVAILABLE_CATEGORIES`: Solo categorías con assets disponibles
  - `ALL_AXIE_CLASSES`: Todas las 9 clases de Axie

### 2. **ABIs Actualizados** (`src/lib/abis/index.ts`) ✅

#### `TRANSMUTER_ABI`:
```typescript
// ANTES: forgeGeode(uint256 geodeType, uint256 mementosToUse)
// AHORA:  forgeGeode(uint8 category, uint8 axieClass, uint256 mementosToUse)

// Nuevas funciones:
- setMementoToken(uint8 axieClass, address tokenAddress)
- mementoTokens(uint8 axieClass) view returns (address)
- getForgedCount(uint8 category, uint8 axieClass) view returns (uint256)
- customForgeCosts(uint8 category) // Ahora por categoría, no por tipo
- failureProbability(uint8 category)

// Eventos actualizados:
- GeodeForged(address user, uint256 category, uint256 axieClass, uint256 tokenId)
- ForgeFailed(address user, uint256 category, uint256 axieClass, uint256 mementosUsed)
- MaxSupplyReached(uint256 category, uint256 axieClass, uint256 totalForged)
- MementoTokenSet(uint256 axieClass, address tokenAddress) // NUEVO
```

#### `GEODE_NFT_ABI`:
```typescript
// ANTES: getGeodeInfo() devolvía (geodeType, forgeDate, creator)
// AHORA:  getGeodeInfo() devuelve (category, axieClass, forgeDate, creator)

// Nuevas funciones:
- getGeodeCategory(uint256 tokenId) view returns (uint8)
- getGeodeClass(uint256 tokenId) view returns (uint8)
- getGeodeName(uint256 tokenId) view returns (string)
- totalSupply() view returns (uint256)

// Eventos actualizados:
- GeodeMinted(address to, uint256 tokenId, uint256 category, uint256 axieClass)
- GeodeBurned(address owner, uint256 tokenId)
```

### 3. **Componente GeodeVideo** (`src/components/GeodeVideo.tsx`) ✅

**ANTES**:
```typescript
<GeodeVideo geodeType={geodeType} />
```

**AHORA**:
```typescript
<GeodeVideo 
  category={GeodeCategory.PETIT} 
  axieClass={AxieClass.BEAST} 
/>
```

**Características**:
- ✅ Soporta sistema de categoría + clase
- ✅ Carga videos desde `/images/geodes/{category}/GEODA {CATEGORY} {CLASS}.mp4`
- ✅ Fallback visual para categorías sin assets (muestra "Próximamente")
- ✅ Overlay de color según la categoría
- ✅ Manejo de errores al cargar videos
- ✅ Componentes exportados: `GeodeVideo`, `GeodeThumbnail`, `GeodeCard`

### 4. **Página de Forja** (`src/app/forge/page.tsx`) ✅

Completamente refactorizada con el nuevo sistema:

**Nuevas Features**:
- ✅ **Selector de Categoría**: Grid con todas las categorías disponibles (solo PETIT activo)
  - Muestra: nombre, max supply, probabilidad de fallo base
  - Indicador visual de color por categoría
  
- ✅ **Selector de Clase de Axie**: Grid 3x3 con las 9 clases
  - Iconos visuales de cada memento
  - Nombres en español
  
- ✅ **Control de Mementos Extra**: 
  - Botones +10/-10 para ajustar cantidad
  - Muestra reducción de probabilidad de fallo en tiempo real
  - Indicador visual verde cuando hay reducción
  
- ✅ **Vista Previa Interactiva**:
  - Video de la geoda seleccionada en tiempo real
  - Badges de categoría y clase con colores distintivos
  - Nombre completo de la geoda (ej: "Petit Bestia")
  
- ✅ **Panel de Costos**:
  - Muestra AXS, SLP y Mementos requeridos
  - Iconos visuales de cada token
  - Memento específico de la clase seleccionada
  
- ✅ **Indicador de Probabilidad de Fallo**:
  - Porcentaje dinámico
  - Barra de progreso visual
  - Se actualiza automáticamente con mementos extra
  
- ✅ **Flujo de Forja**:
  - Paso 1: Seleccionar (continuar)
  - Paso 2: Aprobar tokens (TODO: conectar con contratos)
  - Paso 3: Forjar geoda (TODO: conectar con contratos)
  - Paso 4: Éxito con opciones de ver inventario o forjar otra

**Estructura de Estados**:
```typescript
const [selectedCategory, setSelectedCategory] = useState<GeodeCategory>(GeodeCategory.PETIT);
const [selectedClass, setSelectedClass] = useState<AxieClass>(AxieClass.BEAST);
const [mementosToUse, setMementosToUse] = useState<number>(0);
const [forgeStep, setForgeStep] = useState<'select' | 'approve' | 'forge' | 'success'>('select');
const [isForging, setIsForging] = useState(false);
const [forgedGeodeId, setForgedGeodeId] = useState<bigint | null>(null);
```

### 5. **Página de Inventario** (`src/app/inventory/page.tsx`) ✅

**Actualizaciones**:

**Interfaz `GeodeInfo` actualizada**:
```typescript
interface GeodeInfo {
  id: bigint;
  category: GeodeCategory;          // NUEVO
  axieClass: AxieClass;             // NUEVO
  categoryName: string;              // NUEVO
  className: string;                 // NUEVO
  fullName: string;                  // NUEVO (ej: "Petit Bestia")
  owner: string;
  createdAt: number;
  hatchTime: number;
  isHatched: boolean;
  canHatch: boolean;
}
```

**Carga de Datos**:
```typescript
// ANTES: const info = await geodeContract.getGeodeInfo(id);
//        const geodeType = Number(info[0]);

// AHORA:  const info = await geodeContract.getGeodeInfo(id);
//        const category = Number(info[0]) as GeodeCategory;
//        const axieClass = Number(info[1]) as AxieClass;
//        const forgeDate = Number(info[2]);
//        const creator = info[3];
```

**Visualización**:
- ✅ Video correcto según categoría y clase
- ✅ Nombre completo de la geoda
- ✅ **Badges de colores**:
  - Badge de categoría con color distintivo
  - Badge de clase con color de Axie
  - Ambos con transparencia y bordes
- ✅ ID de token en texto pequeño

### 6. **Servicio de Mineros** (`src/services/nft/minerService.ts`) ✅

**Correcciones**:
- ✅ Imports corregidos (enums como valores, no types)
- ✅ `getMinerData()` ahora retorna todos los campos de `CoreMiner`
- ✅ Nueva función `getMinerTypeMapping()` para convertir `minerType` → `AxieType` + `GeodeStage`
- ✅ `calculateRarity()` ahora retorna enum `Rarity` correctamente
- ✅ Compatibilidad con interfaz `CoreMiner` de `types/game.ts`

---

## 📁 Estructura de Assets

```
public/
├── images/
│   ├── geodes/
│   │   ├── petit/                  ✅ COMPLETO (9 videos)
│   │   │   ├── GEODA PETIT AQUA.mp4
│   │   │   ├── GEODA PETIT AVE.mp4
│   │   │   ├── GEODA PETIT BESTIA.mp4
│   │   │   ├── GEODA PETIT BICHO.mp4
│   │   │   ├── GEODA PETIT DAWN.mp4
│   │   │   ├── GEODA PETIT DUSK.mp4
│   │   │   ├── GEODA PETIT MECH.mp4
│   │   │   ├── GEODA PETIT PLANTA.mp4
│   │   │   └── GEODA PETIT REPTIL.mp4
│   │   ├── alto/                   ⏳ PENDIENTE
│   │   └── animal/                 ⏳ PENDIENTE
│   ├── mementos/                   ✅ COMPLETO (9 iconos)
│   │   ├── memento-aqua.webp
│   │   ├── memento-beast.webp
│   │   ├── memento-bird.webp
│   │   ├── memento-bug.webp
│   │   ├── memento-dawn.webp
│   │   ├── memento-dusk.webp
│   │   ├── memento-mech.webp
│   │   ├── memento-plant.webp
│   │   └── memento-reptile.webp
│   └── axies/
│       ├── axs-icon.webp
│       ├── slp-icon.webp
│       └── memento-material-icon.webp
```

---

## 🎨 Sistema de Colores por Categoría

```typescript
PETIT:      #94a3b8  (slate-400)   - Común
ALTO:       #22c55e  (green-500)   - Poco Común
ANIMAL:     #3b82f6  (blue-500)    - Raro
ULTRAMECH:  #a855f7  (purple-500)  - Ultra Raro
TANQUE:     #f59e0b  (amber-500)   - Épico
```

## 🎨 Sistema de Colores por Clase de Axie

```typescript
BEAST:      #f59e0b  (amber-500)
AQUA:       #3b82f6  (blue-500)
BIRD:       #ec4899  (pink-500)
REPTILE:    #a855f7  (purple-500)
BUG:        #ef4444  (red-500)
PLANT:      #22c55e  (green-500)
MECH:       #64748b  (slate-500)
DUSK:       #6366f1  (indigo-500)
DAWN:       #f97316  (orange-500)
```

---

## 📊 Configuración de Categorías

| Categoría | Max Supply | Fallo Base | AXS  | SLP    | Memento |
|-----------|------------|------------|------|--------|---------|
| PETIT     | 10,000     | 10%        | 0.1  | 5,000  | 5       |
| ALTO      | 7,500      | 20%        | 0.5  | 10,000 | 10      |
| ANIMAL    | 5,000      | 30%        | 1.0  | 15,000 | 15      |
| ULTRAMECH | 5,000      | 40%        | 2.0  | 20,000 | 20      |
| TANQUE    | 5,000      | 50%        | 5.0  | 30,000 | 30      |

---

## ⚙️ TODOs Pendientes

### Frontend:
1. **Conectar forja real con contratos**:
   - Implementar `handleApprove()` con `useWriteContract` de wagmi
   - Implementar `handleForge()` llamando a `transmuterContract.forgeGeode(category, class, mementos)`
   - Escuchar eventos `GeodeForged` y `ForgeFailed`

2. **Sistema de balances**:
   - Hook para leer balances de AXS, SLP y 9 mementos
   - Validación de fondos suficientes antes de forjar
   - Actualización de balances en tiempo real

3. **Sistema de aprobaciones**:
   - Verificar allowances de AXS, SLP y memento seleccionado
   - Aprobar solo los tokens necesarios
   - Tracking de aprobaciones por sesión

4. **Agregar assets restantes**:
   - Videos de ALTO (9 archivos)
   - Videos de ANIMAL (9 archivos)
   - Videos de ULTRAMECH (9 archivos)
   - Videos de TANQUE (9 archivos)

5. **Mejoras de UX**:
   - Loading states durante transacciones
   - Confirmaciones de wallet
   - Animaciones de éxito/fallo
   - Historial de forjas recientes

### Backend/Contratos:
1. **Deployment**:
   - Desplegar 9 tokens de memento (uno por clase)
   - Desplegar sistema completo actualizado
   - Configurar mementos en Transmuter con `setMementoToken()`
   - Configurar loot tables y costos

2. **Testing**:
   - Probar forja con cada combinación categoría + clase
   - Verificar probabilidades de fallo
   - Testear eventos emitidos
   - Validar max supplies

---

## 🚀 Próximos Pasos

1. ✅ ~~Corregir errores de TypeScript en `minerService.ts`~~
2. ✅ ~~Crear constantes de geodas~~
3. ✅ ~~Actualizar ABIs~~
4. ✅ ~~Actualizar componente `GeodeVideo`~~
5. ✅ ~~Refactorizar página de forja~~
6. ✅ ~~Actualizar inventario~~
7. ⏳ Implementar conexión real con contratos en forja
8. ⏳ Desplegar contratos actualizados
9. ⏳ Agregar videos de las demás categorías
10. ⏳ Testing end-to-end del sistema completo

---

## 📝 Notas Importantes

- **Solo PETIT disponible**: Por ahora solo hay assets para geodas PETIT. Las demás categorías muestran "Próximamente".
- **Mementos por clase**: Cada clase de Axie tiene su propio token de memento con icono único.
- **Probabilidad dinámica**: La UI calcula y muestra en tiempo real la reducción de fallo con mementos extra.
- **Compatibilidad**: Todo el sistema está preparado para cuando se desplieguen los contratos actualizados.
- **Type safety**: Todos los tipos están correctamente definidos y alineados entre frontend y contratos.

---

**Fecha de actualización**: Noviembre 10, 2025
**Estado**: Frontend completamente actualizado y listo para integración con contratos
