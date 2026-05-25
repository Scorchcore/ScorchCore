# 🌐 Providers - React Context Providers

Providers de React Context para funcionalidad global.

---

## 📂 Estructura

```
providers/
├── Web3Provider.tsx    # Provider para Web3/Wagmi
└── README.md
```

---

## 🎯 Propósito

Los **Providers** envuelven la aplicación proporcionando contexto global:
- Conexión a wallet (Wagmi)
- Estado de autenticación
- Configuración de red
- Temas, i18n, etc.

---

## 📖 Providers Disponibles

### **Web3Provider** - Conexión a Blockchain

**Propósito:** Proveer funcionalidad Web3 a toda la aplicación usando Wagmi.

```typescript
import { Web3Provider } from '@/lib/providers/Web3Provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

**Características:**
- ✅ Configuración de Wagmi
- ✅ Soporte multi-chain
- ✅ Conectores de wallets (MetaMask, WalletConnect, etc.)
- ✅ Cliente público y de wallet

---

## 🔧 Configuración

### **Web3Provider Setup**
```typescript
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { ronin, roninTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [ronin, roninTestnet],
  transports: {
    [ronin.id]: http(),
    [roninTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## 🎯 Uso en Componentes

### **Acceder a Wallet**
```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        Disconnect {address?.slice(0, 6)}...
      </button>
    );
  }
  
  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}
```

### **Detectar Red**
```typescript
import { useAccount } from 'wagmi';

function NetworkIndicator() {
  const { chain } = useAccount();
  
  if (!chain) return <div>No network</div>;
  
  return (
    <div>
      Connected to: {chain.name} (ID: {chain.id})
    </div>
  );
}
```

---

## 🌐 Redes Soportadas

### **Configuración de Chains**
```typescript
import { defineChain } from 'viem';

export const ronin = defineChain({
  id: 2020,
  name: 'Ronin',
  network: 'ronin',
  nativeCurrency: {
    decimals: 18,
    name: 'RON',
    symbol: 'RON',
  },
  rpcUrls: {
    default: { http: ['https://api.roninchain.com/rpc'] },
    public: { http: ['https://api.roninchain.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Ronin Explorer', url: 'https://explorer.roninchain.com' },
  },
});

export const roninTestnet = defineChain({
  id: 2021,
  name: 'Ronin Testnet',
  // ... testnet config
});
```

---

## 🔌 Conectores de Wallet

### **Configurar Conectores**
```typescript
import { injected, walletConnect } from 'wagmi/connectors';

const config = createConfig({
  chains: [ronin, roninTestnet],
  connectors: [
    injected(), // MetaMask, Rabby, etc.
    walletConnect({ 
      projectId: 'YOUR_PROJECT_ID',
      showQrModal: true 
    }),
  ],
  transports: {
    [ronin.id]: http(),
    [roninTestnet.id]: http(),
  },
});
```

### **Usar Conectores**
```typescript
import { useConnect } from 'wagmi';

function ConnectOptions() {
  const { connect, connectors, isPending } = useConnect();
  
  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
```

---

## ✅ Beneficios

### **1. Centralización**
- Configuración de Web3 en un solo lugar
- Fácil de cambiar/actualizar

### **2. Type Safety**
```typescript
// ✅ Tipos inferidos automáticamente
const { address } = useAccount();
//      ^ Type: `0x${string}` | undefined
```

### **3. React Query Integration**
- Caché automático de llamadas RPC
- Re-fetch inteligente
- Loading/error states

---

## 🧪 Testing

### **Mock de Web3Provider**
```typescript
import { WagmiProvider } from 'wagmi';
import { renderHook } from '@testing-library/react';

const mockConfig = createConfig({
  chains: [roninTestnet],
  transports: {
    [roninTestnet.id]: http('http://localhost:8545'),
  },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={mockConfig}>
      {children}
    </WagmiProvider>
  );
}

it('should connect wallet', async () => {
  const { result } = renderHook(() => useAccount(), { wrapper });
  expect(result.current.isConnected).toBe(false);
});
```

---

## 🔄 Providers Futuros

### **ThemeProvider** (Opcional)
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### **AuthProvider** (Opcional)
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 📚 Archivos Relacionados

- [`/lib/hooks`](../hooks/README.md) - Hooks que usan providers
- [`/lib/contracts`](../contracts/README.md) - ContractManager

---

**Última actualización:** 20 Enero 2026
