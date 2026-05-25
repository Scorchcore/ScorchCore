# Geoda ALTO Agregada ✅

## Cambios Realizados

### 1. **Categoría ALTO Habilitada**

ALTO ahora está disponible en el selector de la página de forja junto con PETIT y ANIMAL.

```typescript
// src/lib/constants/geodes.ts
export function isCategoryAvailable(category: GeodeCategory): boolean {
  return category === GeodeCategory.PETIT || 
         category === GeodeCategory.ALTO || 
         category === GeodeCategory.ANIMAL;
}
```

### 2. **Valores de ALTO (según CSV)**

| Propiedad | Valor |
|-----------|-------|
| **Rareza** | Poco Común |
| **Max Supply** | 7,500 |
| **Poder de Minado** | 125 |
| **Bonus de Colección** | 2.0% |
| **Costo de Reparación** | 3% |
| **Color** | #22c55e (verde) |

### 3. **Costos de Forja ALTO**

| Token | Cantidad |
|-------|----------|
| **AXS** | 250 |
| **SLP** | 100,000 |
| **Mementos** | 250 |

### 4. **Probabilidad de Fallo**

- **Base**: 20%
- **Reducción**: 1% por cada 10 mementos extra
- **Mínimo**: 0% (con 200+ mementos extra)

### 5. **Videos Verificados** ✅

Los videos están en: `public/images/geodes/alto/`

Archivos verificados (9 videos MP4):
- ✅ `GEODA ALTO AMANECER.mp4` (Dawn)
- ✅ `GEODA ALTO AQUA.mp4`
- ✅ `GEODA ALTO AVE.mp4`
- ✅ `GEODA ALTO BESTIA.mp4`
- ✅ `GEODA ALTO BICHO.mp4`
- ✅ `GEODA ALTO MECH.mp4`
- ✅ `GEODA ALTO OSCURIDAD.mp4` (Dusk)
- ✅ `GEODA ALTO PLANTA.mp4`
- ✅ `GEODA ALTO REPTIL.mp4`

**Nota**: ALTO usa nombres diferentes para Dawn/Dusk:
- Dawn → `AMANECER`
- Dusk → `OSCURIDAD`

### 6. **Mapeo Especial para ALTO**

El sistema maneja automáticamente las diferencias de nombres:

```typescript
// Para ALTO:
DUSK → "OSCURIDAD"
DAWN → "AMANECER"

// Para otras categorías:
DUSK → "DUSK"
DAWN → "DAWN"
```

### 7. **Rutas de Video Generadas**

```typescript
// Ejemplo para ALTO + BESTIA:
"/images/geodes/alto/GEODA ALTO BESTIA.mp4"

// Ejemplo para ALTO + DAWN (Amanecer):
"/images/geodes/alto/GEODA ALTO AMANECER.mp4"

// Ejemplo para ALTO + DUSK (Oscuridad):
"/images/geodes/alto/GEODA ALTO OSCURIDAD.mp4"
```

## UI Actualizada

### Página de Forja

Ahora muestra **3 categorías disponibles**:

1. **Petit (Común)**
   - Color: Gris (#94a3b8)
   - Max Supply: 10,000
   - Poder: 75
   - Costo: 100 AXS + 50k SLP + 100 Mementos
   - Fallo: 10%

2. **Alto (Poco Común)** ← NUEVO ✨
   - Color: Verde (#22c55e)
   - Max Supply: 7,500
   - Poder: 125
   - Costo: 250 AXS + 100k SLP + 250 Mementos
   - Fallo: 20%

3. **Animal (Raro)**
   - Color: Azul (#3b82f6)
   - Max Supply: 5,000
   - Poder: 165
   - Costo: 500 AXS + 150k SLP + 500 Mementos
   - Fallo: 30%

### Panel de Estadísticas

Cuando seleccionas ALTO, el panel muestra:

**Información General**:
- Max Supply: 7,500
- Rareza: Poco Común (en verde)
- Tiempo de eclosión: 24 horas

**CoreMiner Resultante**:
- Poder de Minado: **125** (en verde)
- Bonus de Colección: **2%** (en azul)
- Costo de Reparación: **3%** (en naranja)

**Tipo de Memento Requerido**:
- Muestra el icono y nombre del memento según la clase de Axie seleccionada

## Comparación Completa

| Aspecto | PETIT | ALTO | ANIMAL |
|---------|-------|------|--------|
| **Rareza** | Común | Poco Común | Raro |
| **Supply** | 10,000 | 7,500 | 5,000 |
| **Poder** | 75 | 125 (1.67x) | 165 (2.2x) |
| **AXS** | 100 | 250 (2.5x) | 500 (5x) |
| **SLP** | 50,000 | 100,000 (2x) | 150,000 (3x) |
| **Mementos** | 100 | 250 (2.5x) | 500 (5x) |
| **Fallo** | 10% | 20% | 30% |
| **Color** | Gris | Verde 🟢 | Azul 🔵 |

## Testing

### Probar en la UI:

1. Ve a la página de forja: `/forge`
2. Verifica que aparezcan **3 categorías**: PETIT, ALTO, ANIMAL
3. Selecciona **ALTO**
4. Verifica que los valores cambien:
   - Costos: 250 AXS, 100k SLP, 250 Mementos
   - Probabilidad de fallo: 20%
   - Poder mostrado: 125
   - Color: Verde
5. Cambia entre las 9 clases de Axie
6. Verifica que el video cambie correctamente
7. **Especialmente prueba Dawn y Dusk** para verificar que los nombres especiales funcionan

### Consola del Navegador:

Para Dawn (Amanecer):
```
🎬 GeodeVideo: {
  category: "Alto",
  class: "Dawn",
  videoPath: "/images/geodes/alto/GEODA ALTO AMANECER.mp4",
  isAvailable: true
}
```

Para Dusk (Oscuridad):
```
🎬 GeodeVideo: {
  category: "Alto",
  class: "Dusk",
  videoPath: "/images/geodes/alto/GEODA ALTO OSCURIDAD.mp4",
  isAvailable: true
}
```

## ROI Comparado

### Costo por Punto de Poder:

| Categoría | AXS/Poder | SLP/Poder | Mementos/Poder |
|-----------|-----------|-----------|----------------|
| PETIT | 1.33 | 666.67 | 1.33 |
| **ALTO** | **2.00** | **800.00** | **2.00** |
| ANIMAL | 3.03 | 909.09 | 3.03 |

**ALTO** ofrece mejor relación costo/poder que ANIMAL, pero peor que PETIT.

## Próximas Categorías

Faltan por agregar:

- ⏳ **ULTRAMECH** (Ultra Raro) - 165 poder, 40% fallo
- ⏳ **TANQUE** (Épico) - 200 poder, 50% fallo

Para agregarlas:
1. Añade videos en `/public/images/geodes/ultramech/` o `/tanque/`
2. Actualiza `isCategoryAvailable()` para incluirlas

## Notas Importantes

- ✅ ALTO usa **AMANECER** y **OSCURIDAD** en nombres de archivo
- ✅ El sistema mapea automáticamente Dawn→AMANECER y Dusk→OSCURIDAD
- ✅ Archivo duplicado eliminado: `GEODA ALTO PLANTA (1).mp4`
- ✅ Los 9 videos están correctamente nombrados
- ✅ Balance entre riesgo (20% fallo) y recompensa (125 poder)

---

**Fecha**: Noviembre 10, 2025  
**Status**: ✅ ALTO completamente integrado  
**Categorías Activas**: PETIT, ALTO, ANIMAL (3/5)
