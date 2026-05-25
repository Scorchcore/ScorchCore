/**
 * TokenConverterWidget
 * 
 * Widget para convertir entre CORE y RON
 * 
 * @pattern Controlled Component
 */

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { usePriceOracle } from '@/lib/hooks/economy/usePriceOracle';
import { parseUnits, formatUnits } from 'ethers';

export function TokenConverterWidget() {
  const { convertTokens, currentPrice, isLoading } = usePriceOracle();
  
  const [fromToken, setFromToken] = useState<'CORE' | 'RON'>('CORE');
  const [toToken, setToToken] = useState<'CORE' | 'RON'>('RON');
  const [fromAmount, setFromAmount] = useState<string>('1');
  const [toAmount, setToAmount] = useState<string>('0');
  const [isConverting, setIsConverting] = useState(false);

  // Convertir automáticamente cuando cambia el input
  useEffect(() => {
    const convert = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0) {
        setToAmount('0');
        return;
      }

      try {
        setIsConverting(true);
        const fromAmountBigInt = parseUnits(fromAmount, 18);
        const result = await convertTokens(fromAmountBigInt, fromToken, toToken);
        
        if (result) {
          const toAmountFormatted = formatUnits(result.toAmount, 18);
          setToAmount(parseFloat(toAmountFormatted).toFixed(6));
        }
      } catch (error) {
        console.error('Error converting:', error);
        setToAmount('0');
      } finally {
        setIsConverting(false);
      }
    };

    const debounce = setTimeout(convert, 300);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, convertTokens]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  return (
    <Card variant="gradient" className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">🔄 Token Converter</h3>
        <p className="text-xs text-gray-400">
          Convierte entre CORE y RON usando precio del oracle
        </p>
      </div>

      {/* From Token */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">De</label>
        <div className="flex gap-2">
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value as 'CORE' | 'RON')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            disabled={isLoading}
          >
            <option value="CORE">💎 CORE</option>
            <option value="RON">💰 RON</option>
          </select>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-right"
            disabled={isLoading}
            step="0.000001"
            min="0"
          />
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleSwapTokens}
          className="bg-slate-700 hover:bg-slate-600 rounded-full p-2 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">A</label>
        <div className="flex gap-2">
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value as 'CORE' | 'RON')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            disabled={isLoading}
          >
            <option value="CORE">💎 CORE</option>
            <option value="RON">💰 RON</option>
          </select>
          <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-right">
            <div className="text-white font-mono">
              {isConverting ? '...' : toAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Info */}
      {currentPrice && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-400 mb-1">Tasa de conversión</div>
          <div className="text-sm text-blue-400">
            1 CORE = ${currentPrice.toFixed(4)} USD
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <div className="text-xs text-orange-400">
          ⚠️ Este es un cálculo estimado basado en el precio del oracle. Las tasas reales en DEX pueden variar.
        </div>
      </div>
    </Card>
  );
}
