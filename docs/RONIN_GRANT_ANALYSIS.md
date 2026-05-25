# 🎯 Análisis para Ronin Ecosystem Grant - ScorchCore Protocol

> **Objetivo**: Identificar gaps y mejoras necesarias para maximizar las posibilidades de obtener un grant de Ronin Network.

---

## 📋 Resumen Ejecutivo

ScorchCore es una dApp funcional con mecánicas de juego interesantes (forja de Geodas, eclosión de CoreMiners, mining). Sin embargo, para competir por un **Builder Grant (hasta $300K RON)** o **Waypoint Gas Grant ($20K RON)**, hay áreas críticas que necesitan desarrollo.

---

## ✅ Lo que YA tienes (Fortalezas)

| Área | Estado | Detalles |
|------|--------|----------|
| **Smart Contracts** | ✅ Desplegados | Transmuter, GeodeNFT, CoreMinerNFT, MiningScheduler en Testnet |
| **Frontend Funcional** | ✅ Completo | Next.js 15, TypeScript, Tailwind, Wagmi |
| **Mecánicas de Juego** | ✅ Implementadas | Forja, Eclosión con RNG, Mining con recompensas |
| **Multi-red** | ✅ Configurado | Soporte Mainnet/Testnet automático |
| **UX de Forja** | ✅ Pulido | Animaciones, ruleta de eclosión, videos de NFTs |
| **Integración Web3** | ✅ Funcional | Conexión wallet, aprobaciones, transacciones |

---

## ❌ Lo que FALTA (Gaps Críticos)

### 1. 🔐 Integración con Ronin Waypoint (CRÍTICO)

**Estado**: ❌ No implementado

**Por qué importa**: El **Waypoint Gas Grant ($20K)** requiere específicamente integración con Ronin Waypoint para onboarding simplificado.

**Qué es Waypoint**: SDK de Ronin para:
- Login sin seed phrase (email/social)
- Transacciones gasless para usuarios
- Onboarding Web2 → Web3 simplificado

**Acción requerida**:
```bash
npm install @roninbuilders/waypoint-sdk
```

**Implementación necesaria**:
- Reemplazar/complementar RainbowKit con Waypoint
- Configurar gas sponsorship
- Flujo de onboarding para usuarios nuevos

**Documentación**: https://docs.roninchain.com/apps/waypoint

---

### 2. 📊 Analytics y Métricas On-chain (CRÍTICO)

**Estado**: ❌ No implementado

**Por qué importa**: Ronin evalúa "existing traction" y "ability to increase onchain activity".

**Qué falta**:
- Dashboard de métricas públicas
- Tracking de usuarios activos
- Volumen de transacciones
- TVL (Total Value Locked)

**Acción requerida**:
- Integrar con Ronin Explorer API para stats
- Crear página `/stats` pública
- Implementar eventos de analytics (Mixpanel/Amplitude)

---

### 3. 🧪 Testing y Auditoría (CRÍTICO)

**Estado**: ❌ No hay tests

**Por qué importa**: Los grants cubren costos de auditoría, pero necesitas demostrar calidad de código.

**Qué falta**:
- Tests unitarios para hooks y servicios
- Tests de integración para flujos críticos
- Tests E2E (Playwright/Cypress)
- Auditoría de smart contracts (o plan para hacerla)

**Acción requerida**:
```bash
npm install -D vitest @testing-library/react playwright
```

**Archivos a crear**:
- `src/lib/hooks/__tests__/useForge.test.ts`
- `src/services/blockchain/__tests__/forgeService.test.ts`
- `e2e/forge-flow.spec.ts`

---

### 4. 🌐 Internacionalización (i18n)

**Estado**: ❌ Solo español

**Por qué importa**: Ronin es global. Limitar a un idioma reduce el potencial de usuarios.

**Acción requerida**:
```bash
npm install next-intl
```

**Idiomas prioritarios**:
- Inglés (obligatorio)
- Español (actual)
- Portugués (mercado LATAM)
- Vietnamita (comunidad Axie fuerte)

---

### 5. 📱 Responsive y Mobile

**Estado**: ⚠️ Parcial

**Por qué importa**: Gran parte de usuarios de Ronin usan mobile (Ronin Wallet App).

**Qué revisar**:
- Flujo de forja en móvil
- Conexión con Ronin Wallet mobile
- Touch interactions en la ruleta de eclosión

---

### 6. 🎮 Gamification y Retención

**Estado**: ⚠️ Básico

**Por qué importa**: Ronin busca proyectos que "onboard new users" y generen actividad recurrente.

**Qué falta**:
- Sistema de logros/achievements
- Leaderboards de mining
- Eventos temporales/seasons
- Referral system
- Daily rewards/check-in

---

### 7. 📄 Documentación Técnica

**Estado**: ⚠️ Incompleta

**Qué falta**:
- Whitepaper del protocolo
- Documentación de smart contracts (NatSpec)
- API documentation
- Diagrama de arquitectura
- Tokenomics detallado

**Acción requerida**:
- Crear `docs/WHITEPAPER.md`
- Crear `docs/ARCHITECTURE.md`
- Crear `docs/TOKENOMICS.md`

---

### 8. 🔗 Integraciones del Ecosistema Ronin

**Estado**: ❌ Aislado

**Por qué importa**: Ronin valora proyectos que se integran con el ecosistema existente.

**Integraciones potenciales**:
| Proyecto | Tipo | Beneficio |
|----------|------|-----------|
| **Katana DEX** | DeFi | Trading de tokens CORE/fCORE |
| **Mavis Market** | NFT Marketplace | Listado de Geodas/CoreMiners |
| **Axie Infinity** | Gaming | Uso real de Axies en el protocolo |
| **RON Staking** | DeFi | Boost por RON stakeado |

---

### 9. 🛡️ Seguridad y Confianza

**Estado**: ⚠️ Básico

**Qué falta**:
- Multisig para admin functions
- Timelock en upgrades
- Bug bounty program
- Verificación de contratos en explorer
- Documentación de riesgos

---

### 10. 📢 Presencia Social y Comunidad

**Estado**: ❓ Desconocido

**Requisitos típicos para grants**:
- Twitter/X activo con engagement
- Discord con comunidad
- Medium/Blog con updates
- GitHub público con actividad

---

## 🎯 Criterios de Evaluación de Ronin (Builder Grant)

Según la documentación oficial, Ronin evalúa:

| Criterio | Tu Estado | Acción Necesaria |
|----------|-----------|------------------|
| **Resolver pain points o nuevas utilidades** | ⚠️ Parcial | Documentar claramente el problema que resuelves |
| **Onboarding de nuevos usuarios** | ❌ Débil | Implementar Waypoint + referrals |
| **Aumentar actividad on-chain** | ⚠️ Parcial | Más mecánicas que requieran transacciones |
| **Tracción existente** | ❓ Desconocido | Necesitas usuarios reales en testnet |
| **Reputación del proyecto** | ❓ Desconocido | Presencia social, historial del equipo |
| **Capacidad de ejecución del equipo** | ❓ Desconocido | Demostrar entregas anteriores |

---

## 📝 Plan de Acción Priorizado

### Fase 1: Fundamentos (1-2 semanas)
- [ ] Integrar Ronin Waypoint SDK
- [ ] Agregar tests básicos (al menos 50% coverage)
- [ ] Verificar contratos en Ronin Explorer
- [ ] Crear whitepaper básico

### Fase 2: Tracción (2-4 semanas)
- [ ] Lanzar beta pública en testnet
- [ ] Crear Discord y Twitter
- [ ] Implementar analytics
- [ ] Conseguir 100+ usuarios de prueba

### Fase 3: Ecosistema (4-6 semanas)
- [ ] Integrar con Mavis Market (listar NFTs)
- [ ] Agregar soporte multi-idioma (EN/ES)
- [ ] Implementar referral system
- [ ] Crear leaderboards

### Fase 4: Aplicación (6-8 semanas)
- [ ] Preparar pitch deck
- [ ] Documentar roadmap detallado
- [ ] Aplicar al grant con métricas reales
- [ ] Solicitar auditoría (puede ser parte del grant)

---

## 💰 Tipo de Grant Recomendado

### Opción A: Waypoint Gas Grant ($20K RON)
**Requisitos**: Integrar Waypoint para gas sponsorship
**Probabilidad de éxito**: Alta (si implementas Waypoint)
**Uso**: Cubrir gas de usuarios nuevos

### Opción B: Builder Grant (hasta $300K RON)
**Requisitos**: Proyecto innovador con tracción
**Probabilidad de éxito**: Media (necesitas más desarrollo)
**Uso**: Desarrollo, auditorías, marketing

**Recomendación**: Aplicar primero al **Waypoint Gas Grant** mientras desarrollas para el Builder Grant.

---

## 📚 Recursos Útiles

- [Ronin Grants Portal](https://grants-portal.roninchain.com/)
- [Ronin Waypoint Docs](https://docs.roninchain.com/apps/waypoint)
- [Ronin Builder Benefits](https://roninchain.notion.site/builder-benefits)
- [Ronin Discord (Builders Channel)](https://discord.gg/roninnetwork)
- [Ejemplo de Aplicación Exitosa](https://roninchain.notion.site/ronin-ecosystem-grants)

---

## ✍️ Checklist Pre-Aplicación

- [ ] Waypoint integrado y funcionando
- [ ] Al menos 50 usuarios activos en testnet
- [ ] Contratos verificados en explorer
- [ ] Whitepaper publicado
- [ ] Twitter con >500 followers
- [ ] Discord con >100 miembros
- [ ] Video demo de 2-3 minutos
- [ ] Pitch deck de 10-15 slides
- [ ] Roadmap de 6-12 meses
- [ ] Equipo doxxeado (al menos parcialmente)

---

## 🏁 Sky Mavis Developer Portal - Checklist Oficial

> Registrado en: https://developers.skymavis.com/

### 📦 Launch NFT Collection Checklist

| Paso | Estado | Notas |
|------|--------|-------|
| **1. Prepare metadata** | | |
| ├─ Preparar metadata según estándares de Ronin Market | ⚠️ Parcial | Tienes metadata pero revisar formato oficial |
| └─ Subir metadata a IPFS/cloud/servidor propio | ❌ Pendiente | Usar Pinata o IPFS |
| **2. Deploy Smart Contract** | | |
| ├─ Desplegar contrato (ERC-721 Sales template o propio) | ✅ Listo | GeodeNFT y CoreMinerNFT desplegados en Testnet |
| └─ Verificar contrato en explorer | ❌ Pendiente | Necesario para "trusted" status |
| **3. List NFT on Ronin Market** | ❌ Pendiente | Requiere metadata + contrato verificado |
| **4. Enable in-game marketplace** *(Opcional)* | ❌ No implementado | Para trading dentro de la dApp |

### 🎮 Build App/Game Checklist

| Paso | Estado | Notas |
|------|--------|-------|
| **Configure general settings** | ✅ Listo | Proyecto registrado en portal |
| **Integrate Wallet SDK** | ❌ Pendiente | Implementar `@sky-mavis/tanto-wagmi` |
| **Apply for gas sponsorship** *(Opcional)* | ❌ Pendiente | Waypoint Gas Grant |

### 🛒 Sell Game Items (On-chain & Off-chain) Checklist

| Paso | Estado | Notas |
|------|--------|-------|
| **Setup your store and Items** | ❌ Pendiente | Configurar tienda de items |
| **Integrate with Ronin Store API** | ❌ Pendiente | Para venta de Forge Tickets |
| **Deploy on Production** | ❌ Pendiente | Después de testnet |
| **Payment Received** | ❌ Pendiente | Configurar pagos |
| **Enable in-game purchase** *(Opcional)* | ❌ Pendiente | Compra de tickets dentro del juego |

---

## 🎫 Nueva Feature: Forge Tickets (Off-chain Items)

> **Concepto**: Sistema de tickets Web2 para desbloquear forjas avanzadas.

### Modelo de Negocio

| Tier de Geoda | Costo | Tipo |
|---------------|-------|------|
| **Petit** | Gratis | On-chain (solo gas) |
| **Medio** | 1 Forge Ticket | Off-chain purchase |
| **Alto** | 2 Forge Tickets | Off-chain purchase |
| **Legendario** | 5 Forge Tickets | Off-chain purchase |

### Implementación Requerida

1. **Ronin Store Integration**
   - Crear items en Ronin Store API
   - Configurar precios en RON/USD
   - Implementar verificación de tickets

2. **Backend necesario**
   - Endpoint para verificar tickets del usuario
   - Sistema de consumo de tickets al forjar
   - Historial de compras

3. **Frontend**
   - UI de compra de tickets
   - Mostrar balance de tickets
   - Bloquear forjas sin tickets suficientes

---

## 📊 Resumen de Progreso

### Por Objetivo

| Objetivo | Progreso | Próximo Paso |
|----------|----------|--------------|
| **Launch NFT Collection** | 30% | Verificar contratos + subir metadata a IPFS |
| **Build App/Game** | 60% | Integrar Wallet SDK (tanto-wagmi) |
| **Sell Game Items** | 0% | Configurar Ronin Store API |

### Prioridad de Implementación

1. 🔴 **Integrar Wallet SDK** - Bloquea todo lo demás
2. 🔴 **Verificar contratos** - Necesario para Ronin Market
3. 🟡 **Subir metadata a IPFS** - Para listar NFTs
4. 🟡 **Ronin Store API** - Para Forge Tickets
5. 🟢 **Gas sponsorship** - Opcional pero recomendado

---

**Última actualización**: 21 Diciembre 2025
**Autor**: Análisis automático de ScorchCore codebase

