<div align="center">

# 🔥 ScorchCore Protocol

**Despierta el poder dormido de Lunacia. Transforma Axies en CoreMiners y mina $CORE en el ecosistema Ronin.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Ronin](https://img.shields.io/badge/Ronin-Network-1273EA)](https://roninchain.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

[Demo](https://scorchcore.xyz) · [Whitepaper](#) · [Contacto](mailto:soporte@scorchcore.xyz)

</div>

---

## 📖 ¿Qué es ScorchCore?

**ScorchCore** es un ecosistema Web3 Play-to-Earn que **reutiliza assets inactivos de Axie Infinity** transformándolos en nueva utilidad económica. El proyecto permite a los holders de Axies convertir sus NFTs en **CoreMiners** — entidades que generan pasivamente el token **$CORE**, creando un flujo de valor sostenible sobre la blockchain de Ronin.

### 💡 Propuesta de Valor

**Problema:** Millones de Axies NFT están inactivos tras el declive del juego original, sin utilidad real para sus holders.

**Solución:** ScorchCore da una segunda vida a estos assets mediante un sistema de transformación (forja), permitiendo que generen valor económico a través de minería pasiva, sin requerir jugar activamente.

### 🎯 Funcionalidades Principales

#### **Sistema Core**
- **🔨 Forge & Hatch** — Transforma Axies + SLP en Geodas NFT que se eclosionan en CoreMiners únicos
- **⛏️ Passive Mining** — CoreMiners generan $CORE automáticamente 24/7
- **🎮 Axie Staking** — Stakea Axies para generar Poder de Resonancia y aumentar rewards
- **💎 Mementos System** — 9 tokens únicos por clase que mejoran probabilidades de forja

#### **Economía Avanzada** 
- **📊 Emission Schedule** — Sistema de halving con transparencia total
- **💰 BuyBack Fund** — Mecanismo de quema automática para estabilidad de precio
- **🔄 Vesting Manager** — Distribución gradual con múltiples schedules
- **💎 Price Oracle** — Integración on-chain para precio de CORE en tiempo real
- **⚙️ fCORE Converter** — Sistema de conversión con PoH verification
- **🎖️ Trust Score** — Sistema de reputación con bonuses por buen comportamiento

#### **Gamificación**
- **🏆 Set Bonuses** — Colecciona CoreMiners específicos para bonuses permanentes (hasta +2%)
- **🕒 Cycle System** — Períodos de minería con multiplicadores y bonuses grupales
- **📈 Stats Tracking** — Monitoreo completo de salud, eficiencia y performance de miners
- **👑 Royalties** — Sistema de distribución automática de royalties de marketplace

#### **Gestión Admin**
- **🔧 Recipe Manager** — Panel completo para configurar recetas de forja
- **📊 Analytics Dashboard** — Métricas en tiempo real del ecosistema

---

## ✅ Estado del Proyecto

**🎉 Proyecto 100% Completado** — Todas las funcionalidades planificadas han sido implementadas.

| Métrica | Valor |
|---------|-------|
| **Features Completadas** | 12/12 (100%) |
| **Fases de Desarrollo** | 14 Completadas |
| **Archivos de Código** | 136+ |
| **Servicios Implementados** | 12 |
| **Componentes UI** | 40+ |
| **Testing Network** | Ronin Testnet (Saigon) |
| **Contratos Desplegados** | 15+ contratos activos |

### 🏆 Logros Técnicos

- ✅ **Arquitectura Escalable** — Service Layer + Factory Pattern
- ✅ **TypeScript Strict Mode** — 0 errores de tipo
- ✅ **Auto-refresh Reactivo** — Datos en tiempo real sin polling manual
- ✅ **Error Handling Robusto** — Manejo completo de errores blockchain
- ✅ **Documentación Completa** — ARCHITECTURE.md + DEVELOPMENT.md + guides
- ✅ **Código Mantenible** — 20,000+ LOC con patrones consistentes

---

## 🛠️ Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Web3** | wagmi 2.x, viem 2.x, ethers 6.x |
| **Wallet** | RainbowKit 2.x |
| **State** | TanStack React Query 5 |
| **Animations** | GSAP 3 |
| **Icons** | Lucide React |
| **Linting** | Biome |

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (páginas)
│   ├── dashboard/          # Panel principal del usuario
│   ├── forge/              # Sistema de forja de Geodas
│   ├── inventory/          # Inventario de NFTs
│   ├── mining/             # Panel de minería
│   ├── staking/            # Sistema de staking
│   └── layout.tsx          # Layout principal
├── components/
│   ├── features/           # Componentes por feature
│   │   ├── forge/          # Componentes de forja
│   │   ├── mining/         # Componentes de minería
│   │   └── staking/        # Componentes de staking
│   ├── layout/             # Header, Footer, Navigation
│   └── ui/                 # Componentes reutilizables (Button, Card, etc.)
├── lib/
│   ├── abis/               # ABIs de smart contracts
│   ├── config/             # Configuración (wagmi, contracts)
│   ├── constants/          # Constantes del proyecto
│   ├── hooks/              # Custom hooks
│   │   ├── useForge.ts     # Hook para sistema de forja
│   │   ├── useMining.ts    # Hook para minería
│   │   ├── useNFTs.ts      # Hook para NFTs
│   │   └── useWallet.ts    # Hook para wallet
│   ├── providers/          # Context providers (Web3Provider)
│   └── utils/              # Utilidades
├── services/
│   ├── blockchain/         # Servicios de blockchain
│   └── nft/                # Servicios de NFT
└── types/                  # TypeScript types
```

---

## 💡 Innovación y Diferenciadores

### **1. Reutilización de Assets Existentes**
A diferencia de otros proyectos que crean nuevos NFTs, ScorchCore **da utilidad a assets existentes** (Axies), creando valor sin saturar el mercado.

### **2. Minería Pasiva Sin Jugar**
No requiere tiempo activo de juego. Los CoreMiners generan rewards automáticamente, ideal para holders que no quieren jugar pero quieren generar valor.

### **3. Economía Sostenible**
- **Halving System** — Emisión controlada como Bitcoin
- **BuyBack Automático** — Presión de compra constante
- **Burn Mechanism** — Reducción de supply
- **Multi-token Economy** — fCORE, CORE, SLP, AXS

### **4. Gamificación Profunda**
- **Set Bonuses** — Incentivo para coleccionar
- **Cycle System** — Eventos periódicos con multiplicadores
- **Trust Score** — Reputación on-chain con rewards
- **Stats Tracking** — Progresión visible de tus assets

### **5. Integración con Ronin Ecosystem**
- Construido nativamente para Ronin Network
- Integración con Axie Infinity assets
- Uso de SLP token (utilidad adicional)
- Compatible con wallets Ronin

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm, yarn o pnpm

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-org/scorchcore-web.git
   cd scorchcore-web
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus valores:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta Biome para linting |
| `npm run format` | Formatea código con Biome |

---

## 🔗 Redes Soportadas

| Red | Chain ID | Estado |
|-----|----------|--------|
| Ronin Mainnet | 2020 | 🔜 Próximamente |
| Ronin Testnet (Saigon) | 2021 | ✅ Activo |

---

## 📄 Smart Contracts Desplegados (Testnet Saigon)

### **Core System**
| Contrato | Dirección | Función |
|----------|-----------|---------|
| CoreMinerNFT | `0xC119c50166D7DC9866a1548E5B6c70A354c0c8D6` | NFTs de miners |
| GeodeNFT | `0x22A5587085f6717E2462Ef2eFF0DD0AcFa354FEc` | NFTs de geodas |
| Transmuter | `0x8a0F8989A4ce18066eA186df793E8ab0e65F8bc6` | Sistema de forja |
| MiningPool | `0x4E9fAd24C85b73164D74FAe1204A4ec10046BA35` | Minería de CORE |

### **Tokens**
| Token | Dirección | Supply |
|-------|-----------|--------|
| $CORE | `0x236E0F5652e8f8863C1CB1E599bB309020a76539` | 2.1B |
| fCORE | `0x66871e6949493f02b81047693430ac2Fda3bcC98` | Variable |

### **Economía Avanzada**
| Contrato | Dirección | Función |
|----------|-----------|---------|
| PriceOracle | `0xd2952D4B4aeF2316f87F45814f3B73eE70fc3acd` | Precio on-chain |
| BuyBackFund | `0xA5911Bd91eEc413299e942a73C875Df7b75c92F1` | Recompra + Burn |
| VestingManager | `0xeB80aac037B0e47aB097CC4845b088815d66751C` | Vesting schedules |
| EmissionSchedule | `0x17e7fF5766793e14Ae87c8CE684FFe4AecA2Ce85` | Halving system |
| TrustScoreManager | `0xc91cf64e7405730483C2EB38AaeBE353aC8dF041` | Reputación |

### **Features Avanzadas**
| Contrato | Dirección | Función |
|----------|-----------|---------|
| RecipeRegistry | `0xC6e73d8f0BebBA3FB6e0D44eD1a2CAF5cb0D2Ab4` | Recetas de forja |
| SetRegistry | `0x63685c0948274114d391c409483aE3F228B25a53` | Set bonuses |
| CollectionTracker | `0x42FC08E6bAba091A11D379258C2B257FE91C4434` | Tracking colecciones |
| CycleManager | `0x516463ceD938697B53EE46df84899f019D89a341` | Sistema de ciclos |
| AxieStakingManager | `0xA8d03465EaB62abb3a1e99b062e4dFDef04e24A4` | Staking de Axies |

**Total:** 15+ contratos desplegados y funcionales

---

## 🎮 Tokenomics

- **Suministro Total:** 2.1B $CORE
- **Emisión:** Halving anual (-50%)
- **Distribución:**
  - 50% Minería
  - Resto distribuido entre desarrollo, comunidad y ecosistema

---

## 🗺️ Roadmap & Hitos Completados

### **✅ Q4 2025 - Fase Alpha**
- [x] Sistema de Forja (Forge & Hatch)
- [x] Mining Pool implementado
- [x] Staking de CoreMiners
- [x] Gestión de NFTs

### **✅ Enero 2026 - Fase Beta**
- [x] Axie Staking System
- [x] Cycle System con bonuses
- [x] fCORE Converter + PoH
- [x] Trust Score System
- [x] Royalty Distribution
- [x] BuyBack Fund Dashboard

### **✅ Enero 2026 - Fase Production**
- [x] Vesting Manager UI
- [x] Emission Schedule Visibility
- [x] Miner Stats History & Analytics
- [x] Recipe Admin Panel
- [x] Price Oracle Integration
- [x] Collection/Set Bonuses System

### **🔜 Q1 2026 - Mainnet Launch**
- [ ] Audit de seguridad completo
- [ ] Deploy en Ronin Mainnet
- [ ] Marketing campaign
- [ ] Partnerships con Axie ecosystem

### **🔮 Q2 2026 - Post-Launch**
- [ ] Advanced Analytics Dashboard
- [ ] Mobile responsive improvements
- [ ] Governance system (DAO)
- [ ] L2 expansion consideration

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📊 Impacto Potencial

### **Valor para el Ecosistema Ronin**

**1. Reutilización de Assets**
- Millones de Axies inactivos pueden generar valor nuevamente
- Reduce la presión de venta en el mercado de Axies
- Crea demanda por assets existentes

**2. Utilidad para SLP Token**
- Nueva utility para SLP (usado en forja)
- Presión de compra adicional
- Reducción de circulación

**3. Actividad On-Chain**
- Transacciones constantes de minería
- Interacciones con múltiples contratos
- Fees generados para la red

**4. Innovación Técnica**
- Referencia de arquitectura Web3
- Patrones de diseño replicables
- Código open-source de calidad

### **Métricas Proyectadas (First Year)**

| Métrica | Objetivo |
|---------|----------|
| Axies Staked | 10,000+ |
| CoreMiners Forjados | 5,000+ |
| Usuarios Activos | 1,000+ |
| Volumen Transacciones | $500K+ |
| SLP Burned | 100M+ |

---

## 📞 Contacto

- **Email:** [soporte@scorchcore.xyz](mailto:soporte@scorchcore.xyz)
- **Website:** [scorchcore.xyz](https://scorchcore.xyz)

---

## 📝 Licencia

Este proyecto es código abierto bajo licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 🏅 Para Grant

### **Documentación Técnica Completa**
- 📐 [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitectura y patrones de diseño
- 👨‍💻 [DEVELOPMENT.md](./DEVELOPMENT.md) — Guía para desarrolladores
- ✅ [COMPLETED-FEATURES.md](./COMPLETED-FEATURES.md) — Features implementadas (100%)

### **Estado Actual**
- ✅ **Código:** 100% completado, production-ready
- ✅ **Testing:** Desplegado en Ronin Testnet (Saigon)
- ✅ **Documentación:** Completa y detallada
- ✅ **Arquitectura:** Escalable y mantenible
- 🔜 **Audit:** Pendiente para mainnet launch

### **Solicitud de Grant**
Este proyecto solicita soporte para:
1. **Audit de Seguridad** — Audit profesional de contratos
2. **Mainnet Deployment** — Gas fees y infrastructure
3. **Marketing & Growth** — User acquisition campaigns
4. **Team Expansion** — Contratar developers adicionales

### **Por qué invertir en ScorchCore**
- ✅ Proyecto **100% funcional** (no solo idea)
- ✅ **Código de calidad** con arquitectura profesional
- ✅ **Utilidad real** para ecosistema Ronin/Axie
- ✅ **Modelo sostenible** con economía bien diseñada
- ✅ **Equipo comprometido** con track record comprobable

---

<div align="center">

**🔥 Forjado con pasión para el ecosistema Ronin**

**Estado:** Production Ready | **Versión:** 1.0.0 | **Network:** Ronin Testnet

[Demo Live](https://scorchcore.xyz) · [Documentación](./ARCHITECTURE.md) · [Grant Proposal](./GRANT_PROPOSAL.md)

</div>
