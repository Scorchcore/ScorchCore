/**
 * Forge Cost Display Component
 * Modular component for displaying forging costs (AXS + SLP)
 * @module ForgeCostDisplay
 */

'use client';

import React, { useEffect, useState } from 'react';
import { MaterialCosts } from '@/lib/contracts/interfaces/IMaterialValidatorContract';
import { formatEther } from 'viem';

export interface ForgeCostDisplayProps {
  category: number;
  costs: MaterialCosts | null;
  loading?: boolean;
  error?: string;
  showBreakdown?: boolean;
  className?: string;
}

/**
 * Displays forging costs with AXS and SLP breakdown
 */
export const ForgeCostDisplay: React.FC<ForgeCostDisplayProps> = ({
  category,
  costs,
  loading = false,
  error,
  showBreakdown = true,
  className = '',
}) => {
  const categoryNames = ['PETIT', 'ALTO', 'ANIMAL', 'ULTRAMECH', 'TANQUE'];

  if (loading) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-6 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/50 rounded-lg p-4 ${className}`}>
        <p className="text-red-400 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  if (!costs) {
    return null;
  }

  const axsAmount = Number(formatEther(costs.axsAmount));
  const slpAmount = Number(formatEther(costs.slpAmount));

  return (
    <div className={`bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>💰</span>
          <span>Forging Costs</span>
          <span className="text-xs text-gray-400">({categoryNames[category]})</span>
        </h3>
      </div>

      {showBreakdown ? (
        <div className="space-y-3">
          {/* AXS Cost */}
          {axsAmount > 0 && (
            <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">AXS Token</p>
                  <p className="text-gray-500 text-xs">Axie Substitute (Testnet)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{axsAmount.toFixed(1)} AXS</p>
                <p className="text-gray-400 text-xs">{axsAmount} {axsAmount === 1 ? 'Axie' : 'Axies'}</p>
              </div>
            </div>
          )}

          {/* SLP Cost */}
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                <span className="text-pink-400 text-sm font-bold">S</span>
              </div>
              <div>
                <p className="text-gray-300 text-sm font-medium">SLP Token</p>
                <p className="text-gray-500 text-xs">Smooth Love Potion</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{slpAmount.toFixed(0)} SLP</p>
            </div>
          </div>

          {/* Total Summary */}
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Required:</p>
              <div className="text-right space-y-1">
                {axsAmount > 0 && (
                  <p className="text-blue-400 text-sm">{axsAmount} AXS</p>
                )}
                <p className="text-pink-400 text-sm">{slpAmount} SLP</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Compact View */
        <div className="flex items-center gap-4">
          {axsAmount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-blue-400 font-bold">{axsAmount}</span>
              <span className="text-gray-400 text-sm">AXS</span>
            </div>
          )}
          <span className="text-gray-600">+</span>
          <div className="flex items-center gap-1">
            <span className="text-pink-400 font-bold">{slpAmount}</span>
            <span className="text-gray-400 text-sm">SLP</span>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-2">
        <p className="text-blue-300 text-xs flex items-start gap-1">
          <span>ℹ️</span>
          <span>
            <strong>Testnet:</strong> AXS tokens substitute real Axie NFTs (1 AXS = 1 Axie) for testing purposes.
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgeCostDisplay;
