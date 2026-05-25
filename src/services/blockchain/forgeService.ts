/**
 * Servicio para interactuar con el contrato ScorchHeartTransmuter
 * Gestiona la forja de Geodas y eclosión de CoreMiners
 */

import { ethers } from 'ethers';
import { TRANSMUTER_ABI, ERC20_ABI, GEODE_NFT_ABI } from '@/lib/abis';

export enum GeodeType {
  PETIT = 0,
  ALTO = 1,
  ANIMAL = 2,
  ULTRAMECH = 3,
  TANQUE = 4,
}

export interface GeodeInfo {
  geodeType: number;
  owner: string;
  createdAt: number;
  hatchTime: number;
  isHatched: boolean;
}

export interface ForgeCosts {
  axs: string;
  slp: string;
  memento: string;
}

// Costos por tipo de geoda (deben coincidir EXACTAMENTE con el contrato)
// Valores en formato "ether" (ya con decimales)
export const GEODE_COSTS: Record<GeodeType, ForgeCosts> = {
  [GeodeType.PETIT]: {
    axs: '0.1',      // 1 * 10^17 en el contrato
    slp: '5000',     // 5000 * 10^18 en el contrato
    memento: '5',    // 5 * 10^18 en el contrato
  },
  [GeodeType.ALTO]: {
    axs: '0.5',      // 5 * 10^17 en el contrato
    slp: '10000',    // 10000 * 10^18 en el contrato
    memento: '10',   // 10 * 10^18 en el contrato
  },
  [GeodeType.ANIMAL]: {
    axs: '2.5',      // 25 * 10^17 en el contrato
    slp: '25000',    // 25000 * 10^18 en el contrato
    memento: '25',   // 25 * 10^18 en el contrato
  },
  [GeodeType.ULTRAMECH]: {
    axs: '5',
    slp: '50000',
    memento: '50',
  },
  [GeodeType.TANQUE]: {
    axs: '10',
    slp: '100000',
    memento: '100',
  },
};

export class ForgeService {
  private transmuterContract: ethers.Contract;
  private axsContract: ethers.Contract;
  private slpContract: ethers.Contract;
  private mementoContract: ethers.Contract;
  private signer: ethers.Signer;
  private geodeNFTContract: ethers.Contract | null = null;

  constructor(
    transmuterAddress: string,
    axsAddress: string,
    slpAddress: string,
    mementoAddress: string,
    signer: ethers.Signer
  ) {
    this.signer = signer;
    this.transmuterContract = new ethers.Contract(transmuterAddress, TRANSMUTER_ABI, signer);
    this.axsContract = new ethers.Contract(axsAddress, ERC20_ABI, signer);
    this.slpContract = new ethers.Contract(slpAddress, ERC20_ABI, signer);
    this.mementoContract = new ethers.Contract(mementoAddress, ERC20_ABI, signer);
  }

  /**
   * Obtiene los balances de tokens del usuario
   */
  async getTokenBalances(userAddress: string): Promise<{
    axs: string;
    slp: string;
    memento: string;
  }> {
    try {
      const [axsBalance, slpBalance, mementoBalance] = await Promise.all([
        this.axsContract.balanceOf(userAddress),
        this.slpContract.balanceOf(userAddress),
        this.mementoContract.balanceOf(userAddress),
      ]);

      return {
        axs: ethers.formatEther(axsBalance),
        slp: ethers.formatEther(slpBalance),
        memento: ethers.formatEther(mementoBalance),
      };
    } catch (error) {
      console.error('Error getting token balances:', error);
      throw new Error('Failed to get token balances');
    }
  }

  /**
   * Verifica si los tokens están aprobados
   */
  async checkApprovals(
    userAddress: string,
    geodeType: GeodeType,
    mementosExtra: number = 0
  ): Promise<{
    axsApproved: boolean;
    slpApproved: boolean;
    mementoApproved: boolean;
  }> {
    try {
      const costs = GEODE_COSTS[geodeType];
      const transmuterAddress = await this.transmuterContract.getAddress();

      const [axsAllowance, slpAllowance, mementoAllowance] = await Promise.all([
        this.axsContract.allowance(userAddress, transmuterAddress),
        this.slpContract.allowance(userAddress, transmuterAddress),
        this.mementoContract.allowance(userAddress, transmuterAddress),
      ]);

      const axsRequired = ethers.parseEther(costs.axs);
      const slpRequired = ethers.parseEther(costs.slp);
      // Incluir mementos extra en el cálculo
      const totalMementoNeeded = parseFloat(costs.memento) + mementosExtra;
      const mementoRequired = ethers.parseEther(totalMementoNeeded.toString());

      return {
        axsApproved: axsAllowance >= axsRequired,
        slpApproved: slpAllowance >= slpRequired,
        mementoApproved: mementoAllowance >= mementoRequired,
      };
    } catch (error) {
      console.error('Error checking approvals:', error);
      throw new Error('Failed to check token approvals');
    }
  }

  /**
   * Aprueba tokens para el contrato Transmuter
   */
  async approveToken(
    tokenType: 'axs' | 'slp' | 'memento',
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const contract =
        tokenType === 'axs'
          ? this.axsContract
          : tokenType === 'slp'
          ? this.slpContract
          : this.mementoContract;

      const transmuterAddress = await this.transmuterContract.getAddress();
      const amountWei = ethers.parseEther(amount);

      const tx = await contract.approve(transmuterAddress, amountWei);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error(`Error approving ${tokenType}:`, error);
      throw new Error(`Failed to approve ${tokenType.toUpperCase()}`);
    }
  }

  /**
   * Aprueba todos los tokens necesarios para forjar una geoda
   */
  async approveAllTokens(geodeType: GeodeType, mementosExtra: number = 0): Promise<void> {
    try {
      const costs = GEODE_COSTS[geodeType];

      // Calcular memento total (base + extra)
      const totalMemento = (parseFloat(costs.memento) + mementosExtra).toString();

      // Aprobar secuencialmente para mejor visibilidad de errores
      console.log('🔐 Aprobando AXS...');
      await this.approveToken('axs', costs.axs);
      console.log('✅ AXS aprobado');

      console.log('🔐 Aprobando SLP...');
      await this.approveToken('slp', costs.slp);
      console.log('✅ SLP aprobado');

      console.log(`🔐 Aprobando Memento (${costs.memento}${mementosExtra > 0 ? ` +${mementosExtra}` : ''})...`);
      await this.approveToken('memento', totalMemento);
      console.log('✅ Memento aprobado');

      console.log('✅ Todos los tokens aprobados exitosamente');
      
      // Esperar 2 segundos para asegurar que las aprobaciones se propaguen
      console.log('⏳ Esperando 2s para propagación...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Listo para forjar');
    } catch (error) {
      console.error('❌ Error approving tokens:', error);
      throw new Error('Failed to approve tokens: ' + (error as Error).message);
    }
  }

  /**
   * Forja una nueva Geoda
   */
  async forgeGeode(
    geodeType: GeodeType,
    mementosToUse: number = 0
  ): Promise<{ 
    tx: ethers.ContractTransactionResponse; 
    geodeId: bigint | null; 
    failed?: boolean;
    reason?: string;
  }> {
    try {
      console.log('🔨 Iniciando forja de geoda tipo:', geodeType);
      console.log('📿 Mementos a usar:', mementosToUse);

      // Debug: verificar configuración del contrato y signer
      console.log('\n🔍 Debug Info:');
      console.log('  Contrato address:', await this.transmuterContract.getAddress());
      console.log('  Signer address:', await this.signer.getAddress());
      console.log('  Contrato tiene runner:', this.transmuterContract.runner !== null);
      console.log('  Runner es signer:', this.transmuterContract.runner === this.signer);
      
      // CRÍTICO: Reconectar el contrato con el signer para asegurar que usa el correcto
      const contractConnected = this.transmuterContract.connect(this.signer) as ethers.Contract;
      console.log('  Contrato reconectado con signer');
      
      // Llamar directamente al método del contrato con gas limit fijo
      // Saltamos estimateGas porque el RPC del navegador tiene problemas
      console.log('\n📤 Llamando a contract.forgeGeode con gas limit fijo...');
      const tx = await contractConnected.forgeGeode(geodeType, mementosToUse, {
        gasLimit: 350000 // Gas fijo, suficiente para la transacción
      });
      
      console.log('⏳ Transacción enviada, esperando confirmación...');
      console.log('🔗 Hash:', tx.hash);

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('No se pudo obtener el receipt de la transacción');
      }
      
      console.log('✅ Transacción confirmada');
      console.log('  Status:', receipt.status);
      console.log('  Gas usado:', receipt.gasUsed.toString());

      // Primero buscar evento ForgeFailed (forja falló por probabilidad)
      const failedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.transmuterContract.interface.parseLog(log);
          return parsed?.name === 'ForgeFailed';
        } catch {
          return false;
        }
      });

      if (failedEvent) {
        console.log('⚠️ Forja falló por probabilidad');
        const parsed = this.transmuterContract.interface.parseLog(failedEvent);
        return {
          tx,
          geodeId: null,
          failed: true,
          reason: 'probability'
        };
      }

      // Buscar evento GeodeForged
      const forgedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.transmuterContract.interface.parseLog(log);
          return parsed?.name === 'GeodeForged';
        } catch {
          return false;
        }
      });

      if (!forgedEvent) {
        throw new Error('No se encontró el evento GeodeForged en la transacción');
      }

      const parsed = this.transmuterContract.interface.parseLog(forgedEvent);
      const geodeId = parsed?.args[2];

      console.log('✅ Geoda forjada exitosamente');
      console.log('🆔 Token ID:', geodeId.toString());

      return { tx, geodeId };
    } catch (error: any) {
      console.error('❌ Error forging geode:', error);
      console.error('📋 Error completo:', JSON.stringify(error, null, 2));
      
      let errorMessage = error.message || 'Error desconocido al forjar geoda';
      
      // Detectar errores comunes
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Balance insuficiente de RON para pagar el gas';
      } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'La transacción fue rechazada por el contrato. Posibles causas:\n' +
          '- Balance insuficiente de tokens (AXS, SLP, Memento)\n' +
          '- Allowance insuficiente (verifica aprobaciones)\n' +
          '- Max supply alcanzado para este tipo de geoda\n' +
          '- Contrato pausado o inactivo';
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      throw new Error('Failed to forge geode: ' + errorMessage);
    }
  }

  /**
   * Obtiene información de una geoda
   */
  async getGeodeInfo(geodeId: bigint): Promise<GeodeInfo> {
    try {
      const info = await this.transmuterContract.getGeodeInfo(geodeId);
      return {
        geodeType: info.geodeType,
        owner: info.owner,
        createdAt: Number(info.createdAt),
        hatchTime: Number(info.hatchTime),
        isHatched: info.isHatched,
      };
    } catch (error) {
      console.error('Error getting geode info:', error);
      throw new Error('Failed to get geode info');
    }
  }

  /**
   * Obtiene una instancia del contrato GeodeNFT (lazy initialization)
   */
  private async getGeodeNFTContract(): Promise<ethers.Contract> {
    if (!this.geodeNFTContract) {
      const geodeNFTAddress = await this.transmuterContract.geodeNFT();
      this.geodeNFTContract = new ethers.Contract(geodeNFTAddress, GEODE_NFT_ABI, this.signer);
    }
    return this.geodeNFTContract;
  }

  /**
   * Lista los tokenIds de geodas que posee un address usando el contrato GeodeNFT
   */
  async listUserGeodeTokenIds(owner: string, limit: number = 100): Promise<bigint[]> {
    try {
      const geodeNFT = await this.getGeodeNFTContract();
      const balance: bigint = await geodeNFT.balanceOf(owner);
      const count = Number(balance);
      const result: bigint[] = [];
      for (let i = 0; i < count && i < limit; i++) {
        try {
          const tokenId: bigint = await geodeNFT.tokenOfOwnerByIndex(owner, i);
          result.push(tokenId);
        } catch {}
      }
      return result;
    } catch (e) {
      console.error('Error listing user geode token IDs:', e);
      return [];
    }
  }

  /**
   * Verifica si una geoda puede eclosionar basado en el tiempo transcurrido
   */
  async canHatch(geodeId: bigint): Promise<boolean> {
    try {
      // Obtener información de la geoda desde el contrato GeodeNFT
      const geodeNFTContract = await this.getGeodeNFTContract();
      const geodeInfo = await geodeNFTContract.getGeodeInfo(geodeId);
      const forgeDate = Number(geodeInfo[2]); // forgeDate está en la posición 2
      
      // Verificar si han pasado 60 segundos (1 minuto para pruebas)
      const hatchTime = forgeDate + 60;
      const now = Math.floor(Date.now() / 1000);
      
      return now >= hatchTime;
    } catch (error) {
      console.error('Error checking if geode can hatch:', error);
      return false;
    }
  }

  /**
   * Eclosiona una geoda para obtener un CoreMiner
   */
  async hatchGeode(geodeId: bigint): Promise<{
    tx: ethers.ContractTransactionResponse;
    minerId: bigint;
    minerData?: {
      tokenId: bigint;
      power: bigint;
      efficiency: bigint;
      isCritical: boolean;
    };
  }> {
    try {
      console.log('🔨 [FORGE_SERVICE] hatchGeode iniciado');
      console.log('🔨 [FORGE_SERVICE] GeodeId:', geodeId.toString());
      console.log('🔨 [FORGE_SERVICE] Transmuter address:', await this.transmuterContract.getAddress());
      console.log('🔨 [FORGE_SERVICE] Signer address:', await this.signer.getAddress());
      
      // Verificar estado de la geoda antes de eclosionar
      console.log('🔨 [FORGE_SERVICE] Verificando estado de la geoda...');
      // Obtener la dirección del GeodeNFT desde el transmuter (evitar hardcode)
      const geodeNFTAddress = await this.transmuterContract.geodeNFT();
      console.log('🔨 [FORGE_SERVICE] GeodeNFT address:', geodeNFTAddress);
      
      const geodeNFTContract = new ethers.Contract(
        geodeNFTAddress,
        GEODE_NFT_ABI,
        this.signer
      );

      // Debug: listar geodas del usuario usando el NFT (balanceOf + tokenOfOwnerByIndex)
      const signerAddressDebug = await this.signer.getAddress();
      try {
        const balance = await geodeNFTContract.balanceOf(signerAddressDebug);
        const count = Number(balance);
        const tokens: string[] = [];
        for (let i = 0; i < count && i < 50; i++) {
          try {
            const tokenId = await geodeNFTContract.tokenOfOwnerByIndex(signerAddressDebug, i);
            tokens.push(tokenId.toString());
          } catch {}
        }
        console.log('🔨 [FORGE_SERVICE] Geodas del usuario según GeodeNFT:', tokens);
        console.log('🔨 [FORGE_SERVICE] ¿Incluye geodeId?', tokens.includes(geodeId.toString()));
      } catch (e) {
        console.log('🔨 [FORGE_SERVICE] No se pudieron listar geodas del usuario vía GeodeNFT. Error:', e);
        try {
          console.log('🔨 [FORGE_SERVICE] Fragments GeodeNFT disponibles:', geodeNFTContract.interface.fragments.map(f => f.format()).slice(0, 50));
        } catch {}
      }
      
      // Verificar que la geoda existe y el usuario es el propietario
      try {
        console.log('🔨 [FORGE_SERVICE] Verificando si la geoda existe...');
        
        // Determinar existencia intentando ownerOf primero (lanza si no existe)
        let exists = false;
        let owner: string | null = null;
        try {
          owner = await geodeNFTContract.ownerOf(geodeId);
          exists = true;
        } catch (e: any) {
          // Algunos contratos no implementan exists; ownerOf lanza en token inexistente
          exists = false;
        }
        console.log('🔨 [FORGE_SERVICE] ¿Geoda existe (ownerOf)?', exists);
        if (!exists) {
          throw new Error(`La geoda con ID ${geodeId.toString()} no existe`);
        }
        
        // Verificar propietario (ya obtenido por ownerOf)
        const ownerAddr = owner!;
        const signerAddress = await this.signer.getAddress();
        console.log('🔨 [FORGE_SERVICE] Propietario de geoda:', ownerAddr);
        console.log('🔨 [FORGE_SERVICE] Dirección del signer:', signerAddress);
        
        if (ownerAddr.toLowerCase() !== signerAddress.toLowerCase()) {
          throw new Error(`No eres el propietario de esta geoda. Propietario: ${ownerAddr}`);
        }
      } catch (error: any) {
        console.error('🔨 [FORGE_SERVICE] Error verificando propietario:', error);
        if (error.message.includes('nonexistent token') || error.message.includes('invalid token ID')) {
          throw new Error('La geoda no existe o ya fue eclosionada');
        }
        throw error;
      }
      
      // Obtener info de la geoda desde el NFT (ABI confirmado)
      const geodeInfo = await geodeNFTContract.getGeodeInfo(geodeId);
      console.log('🔨 [FORGE_SERVICE] Info de geoda:', {
        category: geodeInfo[0].toString(),
        axieClass: geodeInfo[1].toString(), 
        forgeDate: geodeInfo[2].toString(),
        owner: geodeInfo[3]
      });
      
      const forgeDate = Number(geodeInfo[2]);
      const hatchTime = forgeDate + 60;
      const now = Math.floor(Date.now() / 1000);
      
      console.log('🔨 [FORGE_SERVICE] Tiempos:', {
        forgeDate,
        hatchTime,
        now,
        canHatch: now >= hatchTime,
        timeRemaining: hatchTime - now
      });
      
      if (now < hatchTime) {
        throw new Error(`Geoda no está lista para eclosionar. Faltan ${hatchTime - now} segundos.`);
      }
      
      // Verificar si la geoda ya fue eclosionada consultando el transmuter
      console.log('🔨 [FORGE_SERVICE] Verificando si la geoda ya fue eclosionada...');
      try {
        // Intentar llamar a una función que solo funciona si la geoda no ha sido eclosionada
        const canHatch = await this.transmuterContract.canHatchGeode(geodeId).catch(() => false);
        console.log('🔨 [FORGE_SERVICE] ¿Puede eclosionar según transmuter?:', canHatch);
        
        if (!canHatch) {
          throw new Error('La geoda ya fue eclosionada o no puede ser eclosionada');
        }
      } catch (error: any) {
        console.log('🔨 [FORGE_SERVICE] No se pudo verificar canHatchGeode, continuando...');
      }
      
      // Verificar si el contrato transmuter tiene permisos para quemar la geoda
      console.log('🔨 [FORGE_SERVICE] Verificando aprobaciones...');
      const operatorAddr = await this.transmuterContract.getAddress();
      const userAddr = await this.signer.getAddress();
      let approved = false;
      
      try {
        // Primero verificar si el token específico ya está aprobado
        const approvedAddr = await geodeNFTContract.getApproved(geodeId);
        console.log('🔨 [FORGE_SERVICE] Token aprobado para:', approvedAddr);
        if (approvedAddr.toLowerCase() === operatorAddr.toLowerCase()) {
          approved = true;
          console.log('🔨 [FORGE_SERVICE] ✅ Token específico ya está aprobado');
        }
      } catch (e) {
        console.log('🔨 [FORGE_SERVICE] getApproved no disponible o falló');
      }

      if (!approved) {
        try {
          // Verificar isApprovedForAll
          const isApprovedForAll = await geodeNFTContract.isApprovedForAll(userAddr, operatorAddr);
          console.log('🔨 [FORGE_SERVICE] ¿Transmuter aprobado para todas las geodas?:', isApprovedForAll);
          if (isApprovedForAll) {
            approved = true;
            console.log('🔨 [FORGE_SERVICE] ✅ Ya tiene aprobación para todas las geodas');
          }
        } catch (e) {
          console.log('🔨 [FORGE_SERVICE] isApprovedForAll falló');
        }
      }

      // Solo pedir aprobación si NO está aprobado
      if (!approved) {
        console.log('🔨 [FORGE_SERVICE] No tiene aprobación, solicitando...');
        try {
          console.log('🔨 [FORGE_SERVICE] Aprobando solo el token actual con approve(tokenId)...');
          const approveTx = await geodeNFTContract.approve(operatorAddr, geodeId);
          console.log('🔨 [FORGE_SERVICE] TX de aprobación enviada, esperando confirmación...');
          const approveReceipt = await approveTx.wait();
          approved = true;
          console.log('🔨 [FORGE_SERVICE] ✅ Aprobación completada. Hash:', approveReceipt.hash);
        } catch (e: any) {
          // Si el usuario cancela, lanzar error específico
          if (e.code === 'ACTION_REJECTED' || e.message?.includes('user rejected')) {
            throw new Error('Usuario canceló la aprobación');
          }
          console.error('🔨 [FORGE_SERVICE] ERROR en approve:', e);
          console.log('🔨 [FORGE_SERVICE] Continuando sin aprobación...');
        }
      }
      
      console.log('🔨 [FORGE_SERVICE] Estado final de aprobación:', approved ? 'APROBADO' : 'NO APROBADO');
      
      console.log('🔨 [FORGE_SERVICE] Llamando al contrato hatchGeode...');
      console.log('🔨 [FORGE_SERVICE] Transmuter address (confirm):', operatorAddr);
      
      // Intentar estimar gas - ESTO ES CRÍTICO para diagnosticar errores del contrato
      let gasLimitOverride: bigint | undefined = undefined;
      try {
        console.log('🔨 [FORGE_SERVICE] Intentando estimar gas para hatchGeode...');
        const gasEstimate = await this.transmuterContract.hatchGeode.estimateGas(geodeId);
        console.log('🔨 [FORGE_SERVICE] ✅ Gas estimado exitosamente:', gasEstimate.toString());
        // Añadir colchón de 20%
        const padded = (gasEstimate * 120n) / 100n;
        gasLimitOverride = padded;
      } catch (gasError: any) {
        console.error('🔨 [FORGE_SERVICE] ❌ ERROR ESTIMANDO GAS - El contrato rechaza la transacción:');
        console.error('🔨 [FORGE_SERVICE] Error completo:', gasError);
        console.error('🔨 [FORGE_SERVICE] Error message:', gasError.message);
        console.error('🔨 [FORGE_SERVICE] Error code:', gasError.code);
        console.error('🔨 [FORGE_SERVICE] Error data:', gasError.data);
        console.error('🔨 [FORGE_SERVICE] Error reason:', gasError.reason);
        
        // Si no podemos estimar gas, el contrato RECHAZARÁ la transacción
        // No tiene sentido continuar, pero lo haremos para ver el error exacto
        console.error('🔨 [FORGE_SERVICE] ⚠️ ADVERTENCIA: La transacción probablemente fallará');
        gasLimitOverride = 400000n;
      }

      // Validar que el ABI expone hatchGeode
      const hasHatch = typeof (this.transmuterContract as any)['hatchGeode'] === 'function';
      if (!hasHatch) {
        console.error('🔨 [FORGE_SERVICE] ABI del Transmuter no expone hatchGeode');
        throw new Error('El ABI del Transmuter no expone hatchGeode; actualiza el ABI o contrato.');
      }

      console.log('🔨 [FORGE_SERVICE] Llamando hatchGeode con parámetros:', {
        geodeId: geodeId.toString(),
        gasLimit: gasLimitOverride?.toString()
      });
      
      const tx = await (this.transmuterContract as any)['hatchGeode'](geodeId, {
        gasLimit: gasLimitOverride
      });
      console.log('🔨 [FORGE_SERVICE] Transacción enviada:', tx.hash);
      console.log('🔨 [FORGE_SERVICE] TX data:', tx.data);
      
      console.log('🔨 [FORGE_SERVICE] Esperando confirmación...');
      const receipt = await tx.wait();
      console.log('🔨 [FORGE_SERVICE] Receipt recibido:', {
        hash: receipt.hash,
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        logs: receipt.logs.length
      });
      
      if (receipt.status === 0) {
        console.error('🔨 [FORGE_SERVICE] TRANSACCIÓN FALLÓ - Status: 0');
        console.error('🔨 [FORGE_SERVICE] Receipt completo:', JSON.stringify(receipt, null, 2));
        throw new Error('Transaction reverted by contract');
      }
      
      console.log('🔨 [FORGE_SERVICE] Transacción confirmada exitosamente');

      // Buscar el evento GeodeHatched del contrato Transmuter
      const geodeHatchedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.transmuterContract.interface.parseLog(log);
          return parsed?.name === 'GeodeHatched';
        } catch {
          return false;
        }
      });

      if (!geodeHatchedEvent) {
        console.error('🔨 [FORGE_SERVICE] GeodeHatched event not found');
        console.error('🔨 [FORGE_SERVICE] Available logs:', receipt.logs.map((log: any) => {
          try {
            const parsed = this.transmuterContract.interface.parseLog(log);
            return parsed?.name;
          } catch {
            return 'unknown';
          }
        }));
        throw new Error('GeodeHatched event not found');
      }

      const parsedEvent = this.transmuterContract.interface.parseLog(geodeHatchedEvent);
      
      // Los args están en un array indexado: [user, tokenId, power, efficiency, isCritical]
      const eventArgs = parsedEvent?.args;
      const user = eventArgs?.[0] || eventArgs?.user;
      const tokenIdRaw = eventArgs?.[1] || eventArgs?.tokenId;
      const powerRaw = eventArgs?.[2] || eventArgs?.power;
      const efficiencyRaw = eventArgs?.[3] || eventArgs?.efficiency;
      const isCriticalRaw = eventArgs?.[4] || eventArgs?.isCritical;
      
      // Convertir a bigint de forma segura (los eventos ya retornan bigint)
      const tokenId = typeof tokenIdRaw === 'bigint' ? tokenIdRaw : BigInt(tokenIdRaw?.toString() || '0');
      const power = typeof powerRaw === 'bigint' ? powerRaw : BigInt(powerRaw?.toString() || '0');
      const efficiency = typeof efficiencyRaw === 'bigint' ? efficiencyRaw : BigInt(efficiencyRaw?.toString() || '0');
      const isCritical = Boolean(isCriticalRaw);
      
      console.log('🔨 [FORGE_SERVICE] ✅ GeodeHatched event:', {
        user,
        tokenId: tokenId.toString(),
        power: power.toString(),
        efficiency: efficiency.toString(),
        isCritical,
        types: {
          tokenId: typeof tokenIdRaw,
          power: typeof powerRaw,
          efficiency: typeof efficiencyRaw,
          isCritical: typeof isCriticalRaw
        }
      });

      const minerData = {
        tokenId,
        power,
        efficiency,
        isCritical
      };

      return { tx, minerId: minerData.tokenId, minerData };
    } catch (error) {
      console.error('Error hatching geode:', error);
      throw new Error('Failed to hatch geode');
    }
  }

  /**
   * Obtiene todas las geodas del usuario
   */
  async getUserGeodes(userAddress: string): Promise<bigint[]> {
    try {
      return await this.transmuterContract.getGeodesForged(userAddress);
    } catch (error) {
      console.error('Error getting user geodes:', error);
      return [];
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createForgeService(
  transmuterAddress: string,
  axsAddress: string,
  slpAddress: string,
  mementoAddress: string,
  signer: ethers.Signer
): ForgeService {
  return new ForgeService(transmuterAddress, axsAddress, slpAddress, mementoAddress, signer);
}
