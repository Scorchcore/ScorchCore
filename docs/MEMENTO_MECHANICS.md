# 💎 Mecánica de Mementos - Sistema de Reducción de Riesgo

## 🎯 **Concepto**

Los **Mementos Extra** permiten a los jugadores **reducir o eliminar** la probabilidad de fallo al forjar geodas, agregando una capa estratégica al juego.

---

## 📊 **Probabilidades de Fallo Base**

Cada tipo de geoda tiene una probabilidad base de fallo:

| Geoda | Fallo Base | Mementos para 0% |
|-------|-----------|------------------|
| **PETIT** | 5% | 1 memento |
| **ALTO** | 10% | 1 memento |
| **ANIMAL** | 15% | 2 mementos |
| **ULTRAMECH** | 20% | 2 mementos |
| **TANQUE** | 25% | 3 mementos |

---

## 🔢 **Mecánica de Reducción**

### **Fórmula:**
```
Probabilidad Final = max(0, Probabilidad Base - (Mementos × 10%))
```

### **Ejemplos:**

**Geoda PETIT (5% base):**
- 0 mementos: 5% fallo
- 1 memento: 0% fallo ✅ (éxito garantizado)

**Geoda ANIMAL (15% base):**
- 0 mementos: 15% fallo
- 1 memento: 5% fallo
- 2 mementos: 0% fallo ✅

**Geoda TANQUE (25% base):**
- 0 mementos: 25% fallo
- 1 memento: 15% fallo
- 2 mementos: 5% fallo
- 3 mementos: 0% fallo ✅

---

## 🎮 **Implementación en el Frontend**

### **1. Estado y Cálculos**

```typescript
const [mementosToUse, setMementosToUse] = useState<number>(0);

const failureProbabilities: Record<GeodeType, number> = {
  [GeodeType.PETIT]: 5,
  [GeodeType.ALTO]: 10,
  [GeodeType.ANIMAL]: 15,
  [GeodeType.ULTRAMECH]: 20,
  [GeodeType.TANQUE]: 25,
};

const calculateFailureChance = (geodeType: GeodeType, mementos: number): number => {
  const baseFailure = failureProbabilities[geodeType] || 0;
  const reduction = mementos * 10;
  return Math.max(0, baseFailure - reduction);
};

const currentFailureChance = calculateFailureChance(selectedGeode, mementosToUse);
```

### **2. Selector de Mementos**

- **Botones +/−** para incrementar/decrementar
- **Límite máximo:** 10 mementos extra
- **Validación:** No permitir si no hay suficiente balance

```typescript
<button
  onClick={() => setMementosToUse(Math.max(0, mementosToUse - 1))}
  disabled={mementosToUse === 0}
>
  −
</button>

<button
  onClick={() => setMementosToUse(Math.min(10, mementosToUse + 1))}
  disabled={
    mementosToUse >= 10 || 
    parseFloat(balances.memento) < (parseFloat(selectedCosts.memento) + mementosToUse + 1)
  }
>
  +
</button>
```

### **3. Indicador Visual de Riesgo**

**Barra de progreso coloreada:**
- 🟢 Verde: 0% (sin riesgo)
- 🟡 Amarillo: 1-10% (riesgo bajo)
- 🔴 Rojo: >10% (riesgo alto)

```typescript
<div className={`h-full ${
  currentFailureChance === 0 ? 'bg-green-500' :
  currentFailureChance <= 10 ? 'bg-yellow-500' :
  'bg-red-500'
}`}
  style={{ width: `${currentFailureChance}%` }}
/>
```

### **4. Warning Card Animado**

Cuando `currentFailureChance > 0`:

```tsx
<Card className="bg-yellow-900/20 border-yellow-500 animate-pulse">
  <p>Tu forja tiene <strong>{currentFailureChance}%</strong> de fallar</p>
  <p>Si falla, consumirás los tokens pero NO obtendrás la geoda.</p>
  <p>💡 Usa mementos extra para reducir o eliminar este riesgo.</p>
</Card>
```

---

## 🔄 **Comportamiento**

### **Al Cambiar de Geoda:**
```typescript
useEffect(() => {
  setMementosToUse(0); // Reset automático
}, [selectedGeode]);
```

### **Validación de Balance:**
```typescript
const hasEnoughTokens = () => {
  const totalMementoNeeded = parseFloat(selectedCosts.memento) + mementosToUse;
  return (
    parseFloat(balances.axs) >= parseFloat(selectedCosts.axs) &&
    parseFloat(balances.slp) >= parseFloat(selectedCosts.slp) &&
    parseFloat(balances.memento) >= totalMementoNeeded
  );
};
```

### **Display de Costos:**
```typescript
// Mostrar: "5 +2" si usa 2 mementos extra
{selectedCosts.memento}
{mementosToUse > 0 && (
  <span className="text-yellow-500"> +{mementosToUse}</span>
)}
```

---

## 🎲 **En el Contrato (Solidity)**

### **Función de Forja:**
```solidity
function forgeGeode(uint256 geodeType, uint256 mementosToUse) external nonReentrant {
    // ... verificaciones y transferencias ...
    
    // Quemar mementos extra
    if (mementosToUse > 0) {
        uint256 mementoAmount = mementosToUse * 10**18;
        require(
            mementoToken.transferFrom(msg.sender, address(0xdead), mementoAmount),
            "Error en transferencia de Mementos adicionales"
        );
    }
    
    // Calcular probabilidad de fallo con mementos
    uint256 failChance = _calculateFailureChance(geodeType, mementosToUse);
    
    // Verificar si la forja tiene éxito
    if (!_checkForgeSuccess(failChance)) {
        emit ForgeFailed(msg.sender, geodeType, mementosToUse);
        return; // Forja falló, tokens ya fueron procesados
    }
    
    // Mintear la geoda
    uint256 tokenId = geodeNFT.mintGeode(msg.sender, geodeType);
    // ...
}
```

### **Cálculo de Probabilidad:**
```solidity
function _calculateFailureChance(
    uint256 geodeType, 
    uint256 mementosToUse
) internal view returns (uint256) {
    uint256 baseFailure = failureProbability[geodeType];
    uint256 reduction = mementosToUse * 10; // 10% por memento
    
    if (reduction >= baseFailure) {
        return 0; // Éxito garantizado
    }
    
    return baseFailure - reduction;
}
```

### **Verificación de Éxito:**
```solidity
function _checkForgeSuccess(uint256 failChance) internal view returns (bool) {
    if (failChance == 0) return true; // Éxito garantizado
    
    uint256 roll = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        msg.sender
    ))) % 100;
    
    return roll >= failChance; // Si roll >= failChance, es éxito
}
```

---

## 💰 **Economía del Sistema**

### **Costos Totales por Geoda (con 0% fallo):**

| Geoda | AXS | SLP | Memento Base | Memento Extra | **Total Memento** |
|-------|-----|-----|--------------|---------------|-------------------|
| PETIT | 0.1 | 5,000 | 5 | +1 | **6** |
| ALTO | 0.5 | 10,000 | 10 | +1 | **11** |
| ANIMAL | 2.5 | 25,000 | 25 | +2 | **27** |
| ULTRAMECH | 5 | 50,000 | 50 | +2 | **52** |
| TANQUE | 10 | 100,000 | 100 | +3 | **103** |

### **Decisión del Jugador:**

**Opción A: Arriesgarse (0 mementos extra)**
- ✅ Ahorra mementos
- ❌ Riesgo de perder todos los tokens

**Opción B: Jugar seguro (mementos para 0%)**
- ✅ Éxito garantizado
- ❌ Costo extra de mementos

**Opción C: Riesgo moderado (1 memento menos)**
- ⚖️ Ahorra 1 memento
- ⚖️ Mantiene riesgo bajo (5-10%)

---

## 🎯 **Estrategias Recomendadas**

### **Para Geodas Baratas (PETIT):**
```
🟢 Usar 1 memento extra
- Costo bajo
- Éxito garantizado
- No vale la pena arriesgarse
```

### **Para Geodas Caras (TANQUE):**
```
🟡 Considerar el riesgo
- Si tienes muchos tokens: úsalo con 0% fallo
- Si escasean mementos: acepta 5-10% de riesgo
- Nunca forjes con >15% de fallo
```

### **Para Farming:**
```
🔵 Optimizar costos
- Forjas masivas de PETIT: usar 1 memento extra
- Geodas de alto valor: siempre 0% fallo
- Acumular mementos en eventos especiales
```

---

## 📱 **UX/UI Highlights**

### **Feedback Visual:**
1. **Barra de progreso** indica riesgo actual
2. **Warning animado** alerta cuando hay riesgo
3. **Color coding** (verde/amarillo/rojo)
4. **Contador grande** de mementos a usar
5. **Costo actualizado** en tiempo real

### **Prevención de Errores:**
- ✅ Botón + deshabilitado si no hay balance
- ✅ Warning claro sobre consecuencias del fallo
- ✅ Reset automático al cambiar geoda
- ✅ Validación antes de permitir forja

---

## 🧪 **Testing**

### **Casos de Prueba:**

1. **Forja con 0 mementos y fallo** ✅
   - Tokens consumidos
   - No geoda minteada
   - Evento `ForgeFailed` emitido

2. **Forja con mementos suficientes** ✅
   - Probabilidad = 0%
   - Siempre exitosa
   - Geoda minteada

3. **Balance insuficiente de mementos** ✅
   - Botón + deshabilitado
   - Warning de tokens insuficientes
   - No permite forjar

4. **Cambio de geoda** ✅
   - Mementos reseteados a 0
   - Probabilidad recalculada
   - UI actualizada

---

## ✅ **Estado de Implementación**

```
Frontend:
✅ Selector de mementos (+/−)
✅ Cálculo de probabilidad
✅ Indicador visual de riesgo
✅ Warning card animado
✅ Validación de balance
✅ Display de costos totales
✅ Reset automático

Backend (Contrato):
✅ Función forgeGeode con mementosToUse
✅ _calculateFailureChance
✅ _checkForgeSuccess con randomness
✅ Eventos ForgeFailed
✅ Quemar mementos extra

Docs:
✅ Mecánica explicada
✅ Estrategias recomendadas
✅ Testing completado
```

---

## 🚀 **Resultado Final**

Los jugadores ahora tienen:
- **Control total** sobre el riesgo de forja
- **Decisiones estratégicas** (costo vs riesgo)
- **Feedback claro** del sistema
- **Prevención de errores** costosos

**La mecánica de mementos añade profundidad al juego sin ser obligatoria, permitiendo a cada jugador decidir su nivel de riesgo aceptable.** 🎮💎
