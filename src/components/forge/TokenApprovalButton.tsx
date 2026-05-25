/**
 * Token Approval Button Component
 * Modular component for handling token approvals with status display
 * @module TokenApprovalButton
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Address } from 'viem';
import { ApprovalStatus } from '@/lib/services/TokenApprovalService';

export interface TokenApprovalButtonProps {
  tokenName: string;
  tokenSymbol: string;
  approvalStatus: ApprovalStatus | null;
  onApprove: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Button component for token approval with status display
 */
export const TokenApprovalButton: React.FC<TokenApprovalButtonProps> = ({
  tokenName,
  tokenSymbol,
  approvalStatus,
  onApprove,
  loading = false,
  disabled = false,
  className = '',
}) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove();
    } finally {
      setIsApproving(false);
    }
  };

  if (!approvalStatus) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const isApproved = approvalStatus.isApproved;
  const hasBalance = approvalStatus.hasBalance;

  return (
    <div className={`bg-gray-800/50 border rounded-lg p-4 ${
      isApproved 
        ? 'border-green-500/50' 
        : !hasBalance 
        ? 'border-red-500/50' 
        : 'border-yellow-500/50'
    } ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isApproved 
                ? 'bg-green-500/20' 
                : 'bg-yellow-500/20'
            }`}>
              <span className={isApproved ? 'text-green-400' : 'text-yellow-400'}>
                {isApproved ? '✓' : '!'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{tokenName}</p>
              <p className="text-gray-400 text-xs">{tokenSymbol}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isApproved 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {isApproved ? 'Approved' : 'Needs Approval'}
          </div>
        </div>

        {/* Balance Check */}
        {!hasBalance && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-2">
            <p className="text-red-400 text-xs">
              ⚠️ Insufficient balance
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isApproved && (
          <button
            onClick={handleApprove}
            disabled={disabled || isApproving || loading || !hasBalance}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              disabled || isApproving || loading || !hasBalance
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 active:scale-95'
            }`}
          >
            {isApproving || loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Approving...</span>
              </span>
            ) : (
              `Approve ${tokenSymbol}`
            )}
          </button>
        )}

        {/* Approved Status */}
        {isApproved && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-2">
            <p className="text-green-400 text-xs text-center">
              ✓ Ready to forge
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenApprovalButton;
