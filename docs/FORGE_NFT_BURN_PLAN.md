# Plan: Transicion de Quema de Tokens ERC-20 a Quema de NFTs ERC-721 en Forge

## Context

El flujo de forja actual (`src/app/forge/page.tsx`) simula la quema de Axies usando tokens ERC-20 (AXS). En produccion (mainnet), el usuario debe quemar Axies reales (ERC-721) para forjar geodas. El plan implementa el flujo completo de quema de NFTs en testnet (Saigon) usando un MockAxieNFT, de modo que toda la infraestructura frontend y service layer este lista para mainnet.

**Problema actual**: La fase "Aprobar AXS" quema tokens ERC-20 cuando deberia quemar NFTs ERC-721.

**Solucion**: Enfoque hibrido — desplegar MockAxieNFT en testnet + construir el flujo completo (seleccion, aprobacion, quema) que se reutiliza directamente en mainnet.

---

## Fase 1: Contrato — MockAxieNFT (Solidity, fuera de este repo)

**Objetivo**: Tener NFTs ERC-721 reales en testnet para simular la quema.

### 1.1 Escribir MockAxieNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockAxieNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => uint8) public axieClass; // 0-8

    constructor() ERC721("MockAxie", "MAXIE") Ownable(msg.sender) {}

    /// Cualquiera puede mintear en testnet
    function mint(address to, uint8 class_) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        axieClass[tokenId] = class_;
        _mint(to, tokenId);
        return tokenId;
    }

    /// Batch mint para testers
    function batchMint(address to, uint8 class_, uint8 count) external {
        for (uint8 i = 0; i < count; i++) {
            uint256 tokenId = _nextTokenId++;
            axieClass[tokenId] = class_;
            _mint(to, tokenId);
        }
    }

    /// Burn — llamado por el MaterialValidator o por el owner del NFT
    function burn(uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId) || 
            getApproved(tokenId) == msg.sender ||
            isApprovedForAll(ownerOf(tokenId), msg.sender),
            "Not authorized to burn"
        );
        _burn(tokenId);
    }
}
```

### 1.2 Actualizar MaterialValidatorTestnet (o desplegar V2)

El `MaterialValidatorTestnet` actual solo cobra ERC-20 (`chargeTokens`). Necesita:
- Agregar referencia al MockAxieNFT (`address public axieNFT`)
- En `validateAxies(user, category, geodeType, axieIds[])`: verificar ownership + quemar los NFTs via `MockAxieNFT.burn(tokenId)`
- Validar cantidad: `axieIds.length >= requiredCount[category]`
- Para TANQUE: validar que al menos 1 sea clase Plant

### 1.3 Configurar ForgeFactory

- Llamar `toggleMaterialValidation(true)` para activar la validacion
- Asegurarse de que `materialValidator()` apunte al validator actualizado

### 1.4 Post-deploy

- Anotar la direccion del MockAxieNFT deployado
- Mintear batch de test NFTs a las wallets de desarrollo

---

## Fase 2: Configuracion Frontend

**Archivos a modificar:**

### 2.1 `src/lib/config/deployment.config.ts`
- Cambiar `axieNFT` de `0x32950db...` (que es ERC-20) a la direccion del MockAxieNFT
- Mantener `axsToken` como esta (ERC-20 para otros usos si los hay)

### 2.2 `src/lib/constants/geodes.ts`
- Agregar campo `axieCount` a `defaultCost` en cada categoria:
  ```typescript
  defaultCost: {
    axieCount: 1,  // NFTs a quemar
    slp: "350",
    memento: "5",
  },
  ```
- Mantener `axs` temporalmente para backward compatibility, pero marcarlo como deprecated

### 2.3 `src/lib/abis/` — Agregar MockAxieNFT ABI
- Crear `mockAxieNFT.abi.ts` con el ABI del contrato (mint, batchMint, burn, axieClass, ERC721Enumerable standard)

---

## Fase 3: NFTFacade — Habilitar Carga de Axies en Testnet

**Archivo**: `src/lib/facades/NFTFacade.ts`

### Cambio principal (lineas 291-298):
```typescript
// ANTES:
if (chainId !== 2020) {
  return [];
}

// DESPUES:
if (chainId !== 2020 && chainId !== 202601) {
  return [];
}
```

### Adaptacion para Mock NFTs en testnet:
- En testnet, usar MockAxieNFT (que tiene `axieClass(tokenId)` en vez de `getAxie(tokenId).genes`)
- Agregar metodo alternativo para parsear clase desde el contrato mock:
  ```typescript
  private async getMockAxieClass(tokenId: bigint): Promise<string> {
    const classId = await mockContract.axieClass(tokenId);
    return ['Beast','Aqua','Bird','Reptile','Bug','Plant','Mech','Dusk','Dawn'][classId];
  }
  ```

---

## Fase 4: Componente — AxieNFTPicker

**Nuevo archivo**: `src/components/features/forge/AxieNFTPicker.tsx`

### Props:
```typescript
interface AxieNFTPickerProps {
  axies: AxieNFT[];
  requiredCount: number;
  selectedCategory: GeodeCategory;
  selectedClass: AxieClass;
  selectedAxieIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}
```

### Funcionalidad:
- Grid de NFTs del usuario (filtrar `isStaked === false`)
- Cada card muestra: token ID, clase (badge con color), checkbox de seleccion
- Validacion de cantidad maxima (`requiredCount`)
- Para TANQUE: mostrar indicador de "necesitas 2 del tipo + 1 Plant"
- Indicador visual de cuantos faltan: "Seleccionados: 1/2 Axies"
- Estilo: cards con `border-cyan-100/12 bg-black/35`, seleccionada con `border-magma-gold/75 bg-orange-500/14`
- Si no tiene suficientes Axies, mostrar mensaje + link a mintear (testnet)

---

## Fase 5: Service Layer — Soporte ERC-721

### 5.1 `src/lib/services/forge/ForgeTokenService.ts`

Agregar metodos:
```typescript
async approveAxieNFTs(): Promise<{ hash: string; success: boolean }>
async checkAxieApproval(userAddress: Address): Promise<boolean>
```

Usar `setApprovalForAll(forgeFactoryAddress, true)` — mas eficiente que aprobar individualmente.

### 5.2 `src/lib/services/forge/ForgeFacade.ts`

Exponer:
```typescript
async approveAxieNFTs(): Promise<{ hash: string; success: boolean }>
async checkAxieApproval(userAddress: Address): Promise<boolean>
```

### 5.3 `src/lib/services/forge/types.ts`

Actualizar `ApprovalStatus`:
```typescript
interface ApprovalStatus {
  slpApproved: boolean;
  mementoApproved: boolean;
  axieNFTApproved: boolean;  // NUEVO — reemplaza axsApproved
}
```

---

## Fase 6: Forge Page — Integracion UI (Wizard Flow)

**Archivo**: `src/app/forge/page.tsx`

### 6.1 Nuevo estado:
```typescript
const [selectedAxieIds, setSelectedAxieIds] = useState<string[]>([]);
```

### 6.2 Nuevo paso en el wizard:
```
Flujo actual:  select -> approve -> forge -> success
Flujo nuevo:   select -> axies -> approve -> forge -> success
```

El paso `"axies"` muestra el `AxieNFTPicker` como una Card en el panel izquierdo, visible despues de seleccionar categoria + clase.

### 6.3 Renumerar pasos visibles:
1. Categoria de Geoda
2. Clase de Axie  
3. **Seleccionar Axies para Quemar** (NUEVO)
4. Mementos Extra (Opcional)

### 6.4 Actualizar `handleApprove`:
- **Eliminar**: `forgeFacade.approveToken('axs', ...)`
- **Agregar**: `forgeFacade.approveAxieNFTs()`
- Mantener: SLP y Memento approvals

### 6.5 Actualizar `handleForge`:
- **Eliminar**: material de AXS del array `materials`
- **Agregar**: `axieIds` al llamar `forgeRecipe`:
  ```typescript
  const axieIds = selectedAxieIds.map(id => BigInt(id));
  await forgeFacade.forgeRecipe(recipeId, materials, selectedClass, mementosToUse, axieIds);
  ```

### 6.6 Actualizar panel de costos:
- Reemplazar fila "AXS" por "Axies a quemar: X" mostrando thumbnails de los NFTs seleccionados
- Mantener filas de SLP y Memento

### 6.7 Condiciones de boton:
- Deshabilitar "Continuar" hasta que `selectedAxieIds.length >= requiredCount`

---

## Fase 7: Helper de Testnet — Mint Mock Axies

### 7.1 Nuevo hook: `src/lib/hooks/nfts/useMockAxieMint.ts`

```typescript
export function useMockAxieMint() {
  // Solo disponible en chainId 202601
  // Expone: mintAxie(class: AxieClass, count?: number)
  // Llama a MockAxieNFT.mint() o batchMint()
}
```

### 7.2 Boton en forge page (solo testnet):

Un boton discreto "Mintear Axie de prueba" visible solo cuando `chainId === 202601`, para que testers puedan obtener NFTs sin salir de la app.

---

## Fase 8: Query Layer

### 8.1 `src/lib/queries/useUserAxies.ts`
- Sin cambios estructurales — una vez que NFTFacade funcione en testnet, la query retornara axies reales
- Agregar invalidacion post-mint en `useInvalidateOnTx.ts`: `afterMockMint()`

---

## Verificacion

1. **Testnet E2E**: 
   - Mintear 3 mock Axies (2 Beast + 1 Plant)
   - Seleccionar categoria PETIT -> seleccionar 1 Axie -> aprobar -> forjar
   - Verificar que el NFT desaparece del wallet post-forja
   - Verificar que se recibe una Geoda NFT

2. **Casos edge**:
   - Usuario sin Axies -> mostrar mensaje + boton mint (testnet)
   - Seleccionar categoria TANQUE -> validar 2+1 Plant
   - Cambiar categoria despues de seleccionar Axies -> reset seleccion

3. **Regresion**:
   - SLP y Memento approval siguen funcionando
   - El resto del flujo (animaciones, success modal) no se afecta

---

## Orden de Implementacion

```
Fase 1 (Contratos) --> Fase 2 (Config) --> Fase 3 (NFTFacade)
                                         /
Fase 4 (AxieNFTPicker) --- en paralelo --
                                         \
Fase 5 (Services) --> Fase 6 (Page) --> Fase 7 (Mint helper) --> Fase 8 (Queries)
```

- **Fases 1-3**: Bloqueantes — necesitan direccion del contrato deployado
- **Fase 4**: Se puede construir en paralelo con datos mock
- **Fases 5-8**: Dependen de las anteriores para integracion completa

---

## Lo que se reutiliza en Mainnet

| Componente | Cambio para mainnet |
|---|---|
| AxieNFTPicker | Ninguno — funciona con cualquier `AxieNFT[]` |
| ForgeTokenService (ERC-721 approval) | Solo cambiar direccion del contrato |
| NFTFacade | Remover paths mock, ya soporta mainnet |
| Forge page wizard | Ninguno |
| MaterialValidator | Desplegar version produccion con validaciones reales (genes, purity, breed count) |
| MockAxieNFT | Se reemplaza por el Axie NFT real de Ronin |
