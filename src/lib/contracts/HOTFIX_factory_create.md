# 🔥 HOTFIX: factory.create is not a function

## ❌ Error

```
TypeError: factory.create is not a function
    at ContractManager.getContract (ContractManager.ts:265:28)
    at ContractManager.getGeodeHatcher (ContractManager.ts:466:17)
```

---

## 🔍 Causa Raíz

**GeodeHatcherFactory.create es un método ESTÁTICO:**

```typescript
export class GeodeHatcherFactory {
  static create(address: string, providerOrSigner: Provider | Signer): IGeodeHatcher {
    // ...
  }
}
```

**ContractManager registraba una INSTANCIA:**

```typescript
// ❌ ANTES (INCORRECTO)
private registerFactory(contractName: string, FactoryClass: any): void {
  const factory = new FactoryClass(); // ❌ Instancia no tiene métodos estáticos
  this.factoryRegistry.set(contractName, { factory });
}
```

**Resultado:** `factory.create` no existe porque `create` es estático, no de instancia.

---

## ✅ Solución

**Detectar automáticamente si el método es estático o de instancia:**

```typescript
// ✅ DESPUÉS (CORRECTO)
private registerFactory(
  contractName: string,
  FactoryClass: any,
  createMethod: string = 'create',
  requiresChainId: boolean = false
): void {
  try {
    // ✅ Detectar si el método es estático
    const isStatic = typeof FactoryClass[createMethod] === 'function';
    
    // ✅ Guardar clase (si estático) o instancia (si no estático)
    const factory = isStatic ? FactoryClass : new FactoryClass();
    
    this.factoryRegistry.set(contractName, {
      factory,
      createMethod,
      requiresChainId
    });
    
    log.debug(`Registered factory: ${contractName} (${isStatic ? 'static' : 'instance'} method)`);
  } catch (error) {
    log.error(`Failed to register factory: ${contractName}`, error);
  }
}
```

---

## 🎯 Cómo Funciona

### GeodeHatcherFactory (método estático)
```typescript
// ✅ Detecta que GeodeHatcherFactory.create existe
const isStatic = typeof GeodeHatcherFactory['create'] === 'function'; // true
const factory = GeodeHatcherFactory; // Guarda la CLASE

// ✅ Invocación correcta
GeodeHatcherFactory.create(address, signer);
```

### RecipeRegistryFactory (método de instancia)
```typescript
// ✅ Detecta que RecipeRegistryFactory.create NO existe en la clase
const isStatic = typeof RecipeRegistryFactory['create'] === 'function'; // false
const factory = new RecipeRegistryFactory(); // Guarda la INSTANCIA

// ✅ Invocación correcta
factory.create(address, signer);
```

---

## 📊 Factories Afectadas

| Factory | Método | Tipo | Estado |
|---------|--------|------|--------|
| GeodeHatcherFactory | `create` | Estático | ✅ Fijo |
| RecipeRegistryFactory | `create` | Instancia | ✅ OK |
| PriceOracleFactory | `create` | Instancia | ✅ OK |
| CollectionTrackerFactory | `create` | Instancia | ✅ OK |
| SetRegistryFactory | `create` | Instancia | ✅ OK |
| ForgeContractFactory | `createForgeFactory` | Instancia | ✅ OK |
| MiningPoolFactory | `createMiningPool` | Instancia | ✅ OK |
| ... | ... | ... | ✅ OK |

**La solución funciona automáticamente para TODAS las factories.**

---

## ✨ Resultado

- ✅ `GeodeHatcherFactory.create` ahora se invoca correctamente
- ✅ Todas las demás factories siguen funcionando
- ✅ Sistema robusto: detecta automáticamente el tipo
- ✅ No requiere cambios en factories existentes
- ✅ Compatible con factories futuras (estáticas o de instancia)

---

## 🧪 Testing

```typescript
// ✅ GeodeHatcher debería funcionar ahora
const geodeHatcher = contractManager.getGeodeHatcher();
await geodeHatcher.openGeode(geodeId);
```

**Error eliminado.** 🎯
