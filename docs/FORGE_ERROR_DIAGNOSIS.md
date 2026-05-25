# 🔍 Diagnóstico de Error de Forja

## ❌ **Error Reportado:**

```
Error: Failed to forge geode: missing revert data 
(action="estimateGas", data=null, reason=null)
code=CALL_EXCEPTION
```

---

## 🎯 **Qué Significa Este Error:**

Este error ocurre cuando **ethers.js intenta estimar el gas** de la transacción y **la simulación falla**, pero el contrato no devuelve un mensaje de error específico.

### **Causas Comunes:**

1. **❌ Balance insuficiente de tokens**
   - No tienes suficiente AXS, SLP o Memento
   
2. **❌ Allowance no aprobado correctamente**
   - Las aprobaciones no se realizaron bien
   - Las aprobaciones expiraron
   
3. **❌ Max supply alcanzado**
   - Ya se forjaron todas las geodas de ese tipo
   
4. **❌ Fondos insuficientes para gas (RON)**
   - No tienes suficiente RON para pagar el gas

5. **❌ Contrato pausado o con error**
   - El contrato está pausado
   - Hay un bug en el contrato

---

## 🛠️ **Cómo Diagnosticar:**

### **Paso 1: Verificar Balances y Allowances**

Desde la carpeta `contratos/`:

```bash
npm run check:balance
```

O con una dirección específica:

```bash
npm run check:balance -- 0xTU_WALLET_ADDRESS
```

**Este script mostrará:**
- ✅ Balances de RON, AXS, SLP, Memento
- ✅ Allowances aprobados para el contrato
- ✅ Costos de forja para geoda PETIT
- ✅ Si puedes o no forjar

---

### **Paso 2: Verificar en Consola del Navegador**

Cuando intentas forjar, el servicio ahora muestra logs detallados:

```javascript
💰 Verificando balances...
Balance AXS: 1000000.0 / Necesario: 500.0
Balance SLP: 1000000.0 / Necesario: 750.0
Balance Memento: 1000000.0 / Necesario: 100.0

🔐 Verificando allowances...
Allowance AXS: 500.0 / Necesario: 500.0
Allowance SLP: 750.0 / Necesario: 750.0
Allowance Memento: 100.0 / Necesario: 100.0
```

**Revisa:**
- ¿Los balances son suficientes?
- ¿Los allowances coinciden con los necesarios?

---

## ✅ **Soluciones:**

### **Solución 1: Reclamar Tokens (si no tienes)**

```bash
cd contratos
npm run claim:tokens
```

Esto te dará:
- 1,000,000 MockAXS
- 1,000,000 MockSLP
- 1,000,000 MockMemento

---

### **Solución 2: Volver a Aprobar Tokens**

Si las aprobaciones fallaron:

1. Ve a `/forge`
2. Click en "Aprobar Tokens" nuevamente
3. Confirma las 3 transacciones en MetaMask
4. Espera confirmaciones
5. Intenta forjar de nuevo

---

### **Solución 3: Verificar RON para Gas**

Necesitas al menos **0.01 RON** para pagar el gas.

**Obtener RON Testnet:**
- Ronin Faucet: https://faucet.roninchain.com/
- Solicita tRON (test RON)

---

### **Solución 4: Revisar Max Supply**

El script `check:balance` muestra:

```
📊 Geode Supply Info (Type 0 - PETIT):
  Forged:     5
  Max Supply: 100
  Available:  95
```

Si `Available = 0`, ya no se pueden forjar más de ese tipo.

---

## 🔧 **Mejoras Implementadas en el Código:**

### **1. Verificación Pre-Forja**

```typescript
// forgeService.ts - Ahora verifica ANTES de intentar forjar
console.log('💰 Verificando balances...');
const axsBalance = await this.axsContract.balanceOf(address);
// ... verifica todos los balances

console.log('🔐 Verificando allowances...');
const axsAllowance = await this.axsContract.allowance(address, transmuter);
// ... verifica todos los allowances
```

### **2. Mejor Logging de Errores**

```typescript
if (error.code === 'CALL_EXCEPTION') {
  errorMessage = 'La transacción fue rechazada. Posibles causas:\n';
  errorMessage += '- Balance insuficiente de tokens\n';
  errorMessage += '- Allowance insuficiente\n';
  errorMessage += '- Max supply alcanzado\n';
  // ...
}
```

---

## 📋 **Checklist de Diagnóstico:**

Antes de forjar, verifica:

- [ ] **RON Balance:** ≥ 0.01 RON para gas
- [ ] **AXS Balance:** ≥ 500 AXS
- [ ] **SLP Balance:** ≥ 750 SLP
- [ ] **Memento Balance:** ≥ 100 Memento
- [ ] **AXS Allowance:** = 500 AXS (aprobado)
- [ ] **SLP Allowance:** = 750 SLP (aprobado)
- [ ] **Memento Allowance:** = 100 Memento (aprobado)
- [ ] **Max Supply:** Geodas disponibles > 0
- [ ] **Wallet conectada:** En Ronin Testnet

---

## 🚀 **Flujo de Solución Rápida:**

```bash
# 1. Ir a carpeta de contratos
cd contratos

# 2. Verificar balances actuales
npm run check:balance

# 3. Si faltan tokens, reclamar
npm run claim:tokens

# 4. Volver a verificar
npm run check:balance

# 5. Debería mostrar ✅ en todo

# 6. Ir al frontend
cd ../ScorchCoreWeb

# 7. Recarga el navegador (Ctrl+R)

# 8. Ve a /forge

# 9. Aprobar tokens (3 transacciones)

# 10. Forjar geoda
```

---

## 📊 **Costos de Forja por Tipo:**

| Geode Type | AXS | SLP | Memento | Max Supply |
|-----------|-----|-----|---------|------------|
| **PETIT (0)** | 500 | 750 | 100 | 100 |
| **ALTO (1)** | 1,500 | 2,250 | 300 | 50 |
| **ANIMAL (2)** | 4,500 | 6,750 | 900 | 30 |
| **ULTRA (3)** | 13,500 | 20,250 | 2,700 | 15 |
| **TANQUE (4)** | 40,500 | 60,750 | 8,100 | 5 |
| **MYTHIC (5)** | 121,500 | 182,250 | 24,300 | 1 |

---

## 💡 **Próximos Pasos:**

1. **Ejecuta `npm run check:balance`** en la carpeta `contratos/`
2. **Revisa la salida** y comparte el resultado
3. **Si falta algo**, ejecuta `npm run claim:tokens`
4. **Intenta forjar de nuevo**

---

## 🔗 **Scripts Disponibles:**

```bash
# Verificar balances y diagnóstico completo
npm run check:balance

# Reclamar tokens de prueba
npm run claim:tokens

# Redesplegar contratos (si es necesario)
npm run deploy:testnet
```

---

## ✅ **Estado Esperado para Forjar:**

```
✅ User CAN forge a PETIT geode!

💰 Token Balances:
  RON:      0.1
  AXS:      1000000.0
  SLP:      1000000.0
  Memento:  1000000.0

🔐 Allowances:
  AXS:      500.0      ✅ OK
  SLP:      750.0      ✅ OK
  Memento:  100.0      ✅ OK
```

Si ves esto, **debería funcionar** la forja. Si no funciona aún con esto, hay un problema en el contrato.
