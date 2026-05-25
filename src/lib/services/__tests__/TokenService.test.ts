/**
 * TokenService Unit Tests
 * 
 * Testing de servicios con Dependency Injection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService } from '../token/TokenService';
import { ContractManager } from '@/lib/contracts/ContractManager';
import type { Address } from 'viem';

// Mocks
const mockERC20Contract = {
  balanceOf: vi.fn(),
  decimals: vi.fn(),
  symbol: vi.fn(),
  name: vi.fn(),
  allowance: vi.fn(),
  approve: vi.fn(),
  transfer: vi.fn(),
  totalSupply: vi.fn(),
};

const mockContractManager = {
  getERC20Token: vi.fn(() => mockERC20Contract),
} as unknown as ContractManager;

describe('TokenService', () => {
  let tokenService: TokenService;
  const tokenAddress: Address = '0x1234567890123456789012345678901234567890';
  const userAddress: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const spenderAddress: Address = '0x9876543210987654321098765432109876543210';

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create fresh service instance
    tokenService = new TokenService(mockContractManager);
  });

  describe('getBalance', () => {
    it('should return token balance for user', async () => {
      const expectedBalance = 1000n;
      mockERC20Contract.balanceOf.mockResolvedValue(expectedBalance);

      const balance = await tokenService.getBalance(tokenAddress, userAddress);

      expect(balance).toBe(expectedBalance);
      expect(mockContractManager.getERC20Token).toHaveBeenCalledWith(tokenAddress);
      expect(mockERC20Contract.balanceOf).toHaveBeenCalledWith(userAddress);
    });

    it('should return 0 on error', async () => {
      mockERC20Contract.balanceOf.mockRejectedValue(new Error('Network error'));

      const balance = await tokenService.getBalance(tokenAddress, userAddress);

      expect(balance).toBe(0n);
    });
  });

  describe('getFormattedBalance', () => {
    it('should return formatted balance with decimals', async () => {
      mockERC20Contract.balanceOf.mockResolvedValue(1000000000000000000n); // 1 token with 18 decimals
      mockERC20Contract.decimals.mockResolvedValue(18);

      const formattedBalance = await tokenService.getFormattedBalance(
        tokenAddress,
        userAddress,
        18
      );

      expect(formattedBalance).toBe('1.0');
    });

    it('should use token decimals if not provided', async () => {
      mockERC20Contract.balanceOf.mockResolvedValue(1000000n); // 1 token with 6 decimals
      mockERC20Contract.decimals.mockResolvedValue(6);

      const formattedBalance = await tokenService.getFormattedBalance(
        tokenAddress,
        userAddress
      );

      expect(formattedBalance).toBe('1.0');
      expect(mockERC20Contract.decimals).toHaveBeenCalled();
    });
  });

  describe('getMultipleBalances', () => {
    it('should return balances for multiple tokens', async () => {
      const tokens = [
        { address: tokenAddress as Address, symbol: 'TEST', decimals: 18 },
      ];

      mockERC20Contract.balanceOf.mockResolvedValue(500000000000000000n); // 0.5 tokens

      const balances = await tokenService.getMultipleBalances(tokens, userAddress);

      expect(balances.TEST).toBeDefined();
      expect(balances.TEST.balance).toBe(500000000000000000n);
      expect(balances.TEST.formatted).toBe('0.5');
    });

    it('should handle errors gracefully for individual tokens', async () => {
      const tokens = [
        { address: tokenAddress as Address, symbol: 'TEST', decimals: 18 },
      ];

      mockERC20Contract.balanceOf.mockRejectedValue(new Error('Token error'));

      const balances = await tokenService.getMultipleBalances(tokens, userAddress);

      expect(balances.TEST).toBeDefined();
      expect(balances.TEST.balance).toBe(0n);
    });
  });

  describe('checkApproval', () => {
    it('should return true if allowance is sufficient', async () => {
      mockERC20Contract.allowance.mockResolvedValue(1000n);

      const result = await tokenService.checkApproval(
        tokenAddress,
        userAddress,
        spenderAddress,
        500n
      );

      expect(result.isApproved).toBe(true);
      expect(result.allowance).toBe(1000n);
    });

    it('should return false if allowance is insufficient', async () => {
      mockERC20Contract.allowance.mockResolvedValue(100n);

      const result = await tokenService.checkApproval(
        tokenAddress,
        userAddress,
        spenderAddress,
        500n
      );

      expect(result.isApproved).toBe(false);
      expect(result.allowance).toBe(100n);
    });
  });

  describe('approve', () => {
    it('should approve token spending and return transaction hash', async () => {
      const mockResult = {
        hash: '0xtxhash',
        success: true,
      };
      mockERC20Contract.approve.mockResolvedValue(mockResult);

      const result = await tokenService.approve(tokenAddress, spenderAddress, 1000n);

      expect(result.hash).toBe('0xtxhash');
      expect(result.success).toBe(true);
      expect(mockERC20Contract.approve).toHaveBeenCalledWith(spenderAddress, 1000n);
    });

    it('should handle approval failure', async () => {
      const mockResult = {
        hash: '0xtxhash',
        success: false,
      };
      mockERC20Contract.approve.mockResolvedValue(mockResult);

      const result = await tokenService.approve(tokenAddress, spenderAddress, 1000n);

      expect(result.success).toBe(false);
    });
  });

  describe('approveMax', () => {
    it('should approve maximum uint256 amount', async () => {
      const mockResult = {
        hash: '0xtxhash',
        success: true,
      };
      mockERC20Contract.approve.mockResolvedValue(mockResult);

      const result = await tokenService.approveMax(tokenAddress, spenderAddress);

      expect(result.success).toBe(true);
      expect(mockERC20Contract.approve).toHaveBeenCalledWith(
        spenderAddress,
        expect.any(BigInt) // MAX_UINT256
      );
    });
  });

  describe('revokeApproval', () => {
    it('should revoke approval by setting allowance to 0', async () => {
      const mockResult = {
        hash: '0xtxhash',
        success: true,
      };
      mockERC20Contract.approve.mockResolvedValue(mockResult);

      const result = await tokenService.revokeApproval(tokenAddress, spenderAddress);

      expect(result.success).toBe(true);
      expect(mockERC20Contract.approve).toHaveBeenCalledWith(spenderAddress, 0n);
    });
  });

  // OBSOLETO: TokenService no implementa transfer() - no es parte de ITokenService
  // Transfer debe hacerse directamente con el contrato ERC20
  /*
  describe('transfer', () => {
    it('should transfer tokens and return transaction result', async () => {
      const mockResult = {
        hash: '0xtxhash',
        success: true,
      };
      mockERC20Contract.transfer.mockResolvedValue(mockResult);

      const result = await tokenService.transfer(tokenAddress, userAddress, 100n);

      expect(result.hash).toBe('0xtxhash');
      expect(result.success).toBe(true);
      expect(mockERC20Contract.transfer).toHaveBeenCalledWith(userAddress, 100n);
    });
  });
  */

  describe('getTokenInfo', () => {
    it('should return complete token information', async () => {
      mockERC20Contract.name.mockResolvedValue('Test Token');
      mockERC20Contract.symbol.mockResolvedValue('TEST');
      mockERC20Contract.decimals.mockResolvedValue(18);
      mockERC20Contract.totalSupply.mockResolvedValue(1000000000000000000000n);

      const info = await tokenService.getTokenInfo(tokenAddress);

      expect(info.name).toBe('Test Token');
      expect(info.symbol).toBe('TEST');
      expect(info.decimals).toBe(18);
      expect(info.totalSupply).toBe(1000000000000000000000n);
    });

    it('should handle errors when getting token info', async () => {
      mockERC20Contract.name.mockRejectedValue(new Error('Contract error'));
      mockERC20Contract.symbol.mockRejectedValue(new Error('Contract error'));
      mockERC20Contract.decimals.mockRejectedValue(new Error('Contract error'));
      mockERC20Contract.totalSupply.mockRejectedValue(new Error('Contract error'));

      await expect(tokenService.getTokenInfo(tokenAddress)).rejects.toThrow();
    });
  });

  describe('Dependency Injection', () => {
    it('should work with injected ContractManager', () => {
      const customManager = {
        getERC20Token: vi.fn(() => mockERC20Contract),
      } as unknown as ContractManager;

      const service = new TokenService(customManager);

      expect(service).toBeInstanceOf(TokenService);
    });

    it('should be reusable across multiple services', async () => {
      // Simular compartir TokenService entre ForgeTokenService y MiningRewardsService
      const sharedTokenService = new TokenService(mockContractManager);

      mockERC20Contract.balanceOf.mockResolvedValue(1000n);

      // Llamada desde ForgeTokenService
      const balance1 = await sharedTokenService.getBalance(tokenAddress, userAddress);

      // Llamada desde MiningRewardsService
      const balance2 = await sharedTokenService.getBalance(tokenAddress, userAddress);

      expect(balance1).toBe(1000n);
      expect(balance2).toBe(1000n);
      expect(mockContractManager.getERC20Token).toHaveBeenCalledTimes(2);
    });
  });
});
