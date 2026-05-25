/**
 * Script de Diagnóstico - Frontend ScorchCore
 * 
 * Abrir en DevTools Console:
 * fetch('/diagnostic.js').then(r=>r.text()).then(eval)
 */

console.log('%c🔍 DIAGNÓSTICO DE CONFIGURACIÓN SCORCHCORE', 'font-size: 20px; color: #00ff00; font-weight: bold');
console.log('━'.repeat(60));

// 1. Verificar Chain ID
const checkChainId = () => {
  console.log('\n%c1️⃣ Chain ID', 'font-size: 16px; font-weight: bold');
  
  try {
    const wagmiStore = localStorage.getItem('wagmi.store');
    if (wagmiStore) {
      const data = JSON.parse(wagmiStore);
      const chainId = data?.state?.data?.chain?.id;
      
      if (chainId === 2021) {
        console.log('   ✅ Chain ID:', chainId, '(Ronin Testnet)');
      } else {
        console.log('   ⚠️ Chain ID:', chainId, '(Esperado: 2021)');
      }
    } else {
      console.log('   ⚠️ No se encontró wagmi.store en localStorage');
    }
  } catch (error) {
    console.log('   ❌ Error leyendo chain ID:', error.message);
  }
};

// 2. Verificar Conexión de Wallet
const checkWalletConnection = () => {
  console.log('\n%c2️⃣ Conexión de Wallet', 'font-size: 16px; font-weight: bold');
  
  if (typeof window.ethereum !== 'undefined') {
    console.log('   ✅ Provider detectado:', window.ethereum.isMetaMask ? 'MetaMask' : 'Otro');
    
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          console.log('   ✅ Cuenta conectada:', accounts[0]);
        } else {
          console.log('   ⚠️ No hay cuentas conectadas');
        }
      })
      .catch(err => {
        console.log('   ❌ Error obteniendo cuentas:', err.message);
      });
  } else {
    console.log('   ❌ No se detectó provider (MetaMask, etc.)');
  }
};

// 3. Direcciones de Contratos Esperadas
const checkContractAddresses = () => {
  console.log('\n%c3️⃣ Direcciones de Contratos (Esperadas)', 'font-size: 16px; font-weight: bold');
  
  const expectedAddresses = {
    coreMinerNFT: '0xC119c50166D7DC9866a1548E5B6c70A354c0c8D6',
    scorchHeartTransmuter: '0x8a0F8989A4ce18066eA186df793E8ab0e65F8bc6',
    miningScheduler: '0xEe4A2d70561D6508238cC2AE6933263cBEBf307A',
    fCoreToken: '0x66871e6949493f02b81047693430ac2Fda3bcC98',
    geodeNFT: '0x22A5587085f6717E2462Ef2eFF0DD0AcFa354FEc',
  };
  
  console.log('   Dirección actualizada (Nov 17):');
  for (const [name, address] of Object.entries(expectedAddresses)) {
    if (name === 'coreMinerNFT' || name === 'scorchHeartTransmuter') {
      console.log(`   ✅ ${name}:`, address, '(Actualizado)');
    } else {
      console.log(`   ✓  ${name}:`, address);
    }
  }
};

// 4. Verificar Local Storage
const checkLocalStorage = () => {
  console.log('\n%c4️⃣ Local Storage', 'font-size: 16px; font-weight: bold');
  
  const keys = ['wagmi.store', 'wagmi.connected', 'wagmi.wallet'];
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`   ✅ ${key}: Presente`);
    } else {
      console.log(`   ⚠️ ${key}: No encontrado`);
    }
  });
};

// 5. Test de Llamada a Contrato (read-only)
const testContractCall = async () => {
  console.log('\n%c5️⃣ Test de Contrato (Read-Only)', 'font-size: 16px; font-weight: bold');
  
  try {
    // Importar ethers desde window si está disponible
    if (typeof window.ethers === 'undefined') {
      console.log('   ⚠️ ethers no disponible en window, saltando test');
      return;
    }
    
    const provider = new ethers.JsonRpcProvider('https://saigon-testnet.roninchain.com/rpc');
    const coreMinerAddress = '0xC119c50166D7DC9866a1548E5B6c70A354c0c8D6';
    
    // ABI simple para totalSupply
    const abi = ['function totalSupply() view returns (uint256)'];
    const contract = new ethers.Contract(coreMinerAddress, abi, provider);
    
    const totalSupply = await contract.totalSupply();
    console.log('   ✅ CoreMinerNFT totalSupply:', totalSupply.toString());
    console.log('   ✅ Contrato respondiendo correctamente');
    
  } catch (error) {
    console.log('   ❌ Error llamando al contrato:', error.message);
  }
};

// 6. Verificar Módulos Cargados
const checkLoadedModules = () => {
  console.log('\n%c6️⃣ Módulos de la App', 'font-size: 16px; font-weight: bold');
  
  const checkGlobal = (name) => {
    if (typeof window[name] !== 'undefined') {
      console.log(`   ✅ ${name}: Cargado`);
    } else {
      console.log(`   ⚠️ ${name}: No disponible`);
    }
  };
  
  checkGlobal('React');
  checkGlobal('ethers');
  checkGlobal('ethereum');
};

// Ejecutar todos los checks
const runDiagnostics = async () => {
  checkChainId();
  checkWalletConnection();
  checkContractAddresses();
  checkLocalStorage();
  checkLoadedModules();
  
  // Test de contrato al final (async)
  await testContractCall();
  
  console.log('\n' + '━'.repeat(60));
  console.log('%c✅ DIAGNÓSTICO COMPLETADO', 'font-size: 18px; color: #00ff00; font-weight: bold');
  console.log('\n💡 Si ves errores, revisa el archivo VERIFICACION_FRONTEND.md');
  console.log('━'.repeat(60) + '\n');
};

// Ejecutar
runDiagnostics().catch(err => {
  console.error('❌ Error en diagnóstico:', err);
});
