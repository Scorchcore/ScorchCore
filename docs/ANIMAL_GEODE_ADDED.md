# Geoda ANIMAL Agregada ✅

## Cambios Realizados

### 1. **Categoría ANIMAL Habilitada**

La categoría ANIMAL ahora está disponible en el selector de la página de forja junto con PETIT.

```typescript
// src/lib/constants/geodes.ts
export function isCategoryAvailable(category: GeodeCategory): boolean {
  return category === GeodeCategory.PETIT || category === GeodeCategory.ANIMAL;
}
```

### 2. **Valores de ANIMAL (según CSV)**

| Propiedad | Valor |
|-----------|-------|
| **Rareza** | Raro |
| **Max Supply** | 5,000 |
| **Poder de Minado** | 165 |
| **Bonus de Colección** | 2.0% |
| **Costo de Reparación** | 3% |
| **Color** | #3b82f6 (azul) |

### 3. **Costos de Forja ANIMAL**

| Token | Cantidad |
|-------|----------|
| **AXS** | 500 |
| **SLP** | 150,000 |
| **Mementos** | 500 |

### 4. **Probabilidad de Fallo**

- **Base**: 30%
- **Reducción**: 1% por cada 10 mementos extra
- **Mínimo**: 0% (con 300+ mementos extra)

### 5. **Videos Requeridos**

Los videos deben estar en: `public/images/geodes/animal/`

Archivos necesarios (9 videos MP4):
- ✅ `GEODA ANIMAL AQUA.mp4`
- ✅ `GEODA ANIMAL AVE.mp4`
- ✅ `GEODA ANIMAL BESTIA.mp4`
- ✅ `GEODA ANIMAL BICHO.mp4`
- ✅ `GEODA ANIMAL DAWN.mp4`
- ✅ `GEODA ANIMAL DUSK.mp4`
- ✅ `GEODA ANIMAL MECH.mp4`
- ✅ `GEODA ANIMAL PLANTA.mp4`
- ✅ `GEODA ANIMAL REPTIL.mp4`

### 6. **Rutas de Video Generadas**

El sistema automáticamente genera las rutas correctas:

```typescript
// Ejemplo para ANIMAL + BESTIA:
"/images/geodes/animal/GEODA ANIMAL BESTIA.mp4"

// Ejemplo para ANIMAL + AQUA:
"/images/geodes/animal/GEODA ANIMAL AQUA.mp4"
```

## UI Actualizada

### Página de Forja

Ahora muestra 2 categorías disponibles en el selector:

1. **Petit (Común)**
   - Color: Gris (#94a3b8)
   - Max Supply: 10,000
   - Poder: 75
   - Costo: 100 AXS + 50k SLP + 100 Mementos
   - Fallo: 10%

2. **Animal (Raro)** ← NUEVO ✨
   - Color: Azul (#3b82f6)
   - Max Supply: 5,000
   - Poder: 165
   - Costo: 500 AXS + 150k SLP + 500 Mementos
   - Fallo: 30%

### Panel de Estadísticas

Cuando seleccionas ANIMAL, el panel muestra:

**Información General**:
- Max Supply: 5,000
- Rareza: Raro (en azul)
- Tiempo de eclosión: 24 horas

**CoreMiner Resultante**:
- Poder de Minado: **165** (en verde)
- Bonus de Colección: **2%** (en azul)
- Costo de Reparación: **3%** (en naranja)

**Tipo de Memento Requerido**:
- Muestra el icono y nombre del memento según la clase de Axie seleccionada

## Comparación PETIT vs ANIMAL

| Aspecto | PETIT | ANIMAL |
|---------|-------|--------|
| **Rareza** | Común | Raro |
| **Supply** | 10,000 | 5,000 |
| **Poder** | 75 | 165 (2.2x) |
| **AXS** | 100 | 500 (5x) |
| **SLP** | 50,000 | 150,000 (3x) |
| **Mementos** | 100 | 500 (5x) |
| **Fallo** | 10% | 30% |
| **Color** | Gris | Azul |

## Testing

### Probar en la UI:

1. Ve a la página de forja: `/forge`
2. Verifica que aparezcan 2 categorías: PETIT y ANIMAL
3. Selecciona ANIMAL
4. Verifica que los valores cambien:
   - Costos: 500 AXS, 150k SLP, 500 Mementos
   - Probabilidad de fallo: 30%
   - Poder mostrado: 165
5. Cambia entre las 9 clases de Axie
6. Verifica que el video cambie correctamente para cada clase

### Consola del Navegador:

Deberías ver logs como:
```
🎬 GeodeVideo: {
  category: "Animal",
  class: "Bestia",
  videoPath: "/images/geodes/animal/GEODA ANIMAL BESTIA.mp4",
  isAvailable: true
}
```

## Próximas Categorías

Para agregar ALTO, ULTRAMECH o TANQUE:

1. Agrega sus videos en las carpetas correspondientes
2. Actualiza `isCategoryAvailable()`:
   ```typescript
   return category === GeodeCategory.PETIT || 
          category === GeodeCategory.ANIMAL ||
          category === GeodeCategory.ALTO; // etc.
   ```

## Notas Importantes

- Los nombres de archivo deben ser EXACTOS (mayúsculas, espacios)
- Los videos deben ser formato MP4
- El sistema usa `key` para forzar recarga al cambiar clase
- Los costos ya están configurados según el whitepaper/CSV

---

**Fecha**: Noviembre 10, 2025  
**Status**: ✅ ANIMAL completamente integrado
