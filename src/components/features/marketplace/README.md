# 🛒 Marketplace Integration - Ronin Marketplace SDK

**Status:** 🔜 Planificado para implementación futura

---

## 📋 Overview

Este módulo contendrá la integración con **Ronin Marketplace Service SDK** para permitir:
- Listar NFTs (CoreMiners, Geodas) en el marketplace
- Ver órdenes activas
- Comprar/vender NFTs
- Historial de transacciones

---

## 🔗 Documentación Oficial

**Ronin Marketplace SDK:**  
https://developers.roninchain.com/console/applications/2241fca0-b1df-4db8-96bf-161963fb439c/marketplace-service/sdk/

**Key Features:**
- Order creation and management
- NFT listing and delisting
- Price discovery
- Transaction history
- Royalty management

---

## 🏗️ Arquitectura Planificada

```
marketplace/
├── MarketplaceService.ts      # Service para SDK integration
├── MarketplaceListings.tsx    # Componente de listings
├── OrderHistory.tsx           # Historial de órdenes
├── PriceChart.tsx             # Gráfico de precios
└── types.ts                   # Types del marketplace
```

---

## 🎯 Features a Implementar

### 1. Listing Management
- Crear listing de CoreMiner/Geoda
- Actualizar precio
- Cancelar listing
- Batch listing

### 2. Order Management
- Ver órdenes activas
- Aceptar ofertas
- Crear ofertas
- Historial de ventas

### 3. Price Discovery
- Floor price por categoría
- Price history charts
- Market trends
- Best offers

### 4. Integration Points
- `NFTFacade` → Obtener NFTs del usuario
- `MetadataService` → Mostrar info de NFTs
- `WalletProvider` → Autenticación
- Ronin Marketplace SDK → API calls

---

## 📦 Dependencias Necesarias

```bash
# Instalar SDK de Ronin Marketplace
npm install @skymavis/ronin-marketplace-sdk
```

---

## 💻 Ejemplo de Uso (Futuro)

```typescript
import { MarketplaceService } from './MarketplaceService';
import { useWallet } from '@/lib/hooks/useWallet';

function MarketplacePage() {
  const { address } = useWallet();
  const marketplaceService = new MarketplaceService();
  
  // Listar NFT
  const listNFT = async (tokenId: bigint, price: bigint) => {
    await marketplaceService.createListing({
      tokenAddress: COREMINER_NFT_ADDRESS,
      tokenId,
      price,
      seller: address
    });
  };
  
  // Ver listings activos
  const getListings = async () => {
    return await marketplaceService.getActiveListings({
      collection: COREMINER_NFT_ADDRESS
    });
  };
}
```

---

## 🔐 Consideraciones de Seguridad

- ✅ Validar precios mínimos (evitar errores de usuario)
- ✅ Verificar ownership antes de listar
- ✅ Confirmar transacciones con modal
- ✅ Manejar cancelaciones de usuario
- ✅ Rate limiting en API calls

---

## 🎨 UI/UX Planificado

### Componentes Clave:
1. **MarketplaceGrid** - Grid de NFTs en venta
2. **ListingModal** - Modal para crear listing
3. **OrderCard** - Card de orden individual
4. **PriceHistory** - Chart de precios históricos
5. **FilterPanel** - Filtros de búsqueda

### Features UI:
- Búsqueda y filtrado avanzado
- Sort por precio, rareza, etc.
- Quick actions (buy now, make offer)
- Mobile responsive
- Loading states y skeletons

---

## 📊 Métricas a Trackear

- Volumen de ventas
- Floor price por categoría
- NFTs listados vs vendidos
- Revenue del equipo (royalties)
- Usuarios activos en marketplace

---

## 🚀 Roadmap de Implementación

### Fase 1: Setup (1 semana)
- [ ] Instalar SDK
- [ ] Crear MarketplaceService base
- [ ] Setup de autenticación

### Fase 2: Core Features (2 semanas)
- [ ] Crear/cancelar listings
- [ ] Ver listings activos
- [ ] Comprar NFT
- [ ] Order history

### Fase 3: Advanced Features (2 semanas)
- [ ] Make offers
- [ ] Price charts
- [ ] Filtros avanzados
- [ ] Notificaciones

### Fase 4: Polish (1 semana)
- [ ] Mobile optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Testing E2E

---

## 📚 Referencias

- [Ronin Marketplace SDK Docs](https://developers.roninchain.com/console/applications/2241fca0-b1df-4db8-96bf-161963fb439c/marketplace-service/sdk/)
- [Ronin Marketplace API](https://developers.roninchain.com/docs/marketplace-api)
- [Best Practices](https://developers.roninchain.com/docs/best-practices)

---

**Status:** 📝 Documentación lista  
**Next Step:** Implementar cuando se complete el audit y mainnet launch  
**Priority:** Medium (post-mainnet)
