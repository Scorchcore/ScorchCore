'use client';

import { Lock, TrendingUp, AlertCircle, Info } from 'lucide-react';
import type { TrustScoreLevel } from '@/lib/contracts/interfaces/ITrustScoreContract';
import { TRUST_SCORE_THRESHOLDS } from '@/lib/contracts/interfaces/ITrustScoreContract';

interface TrustScoreRequirementTooltipProps {
  requiredLevel: TrustScoreLevel;
  userLevel: TrustScoreLevel;
  userScore: number;
  requiredScore: number;
  categoryName: string;
  isBlocked?: boolean;
  className?: string;
}

/**
 * Tooltip que muestra el requisito de TrustScore para acceder a una categoría
 * 
 * @pattern Presentation Component - UI con información de requisitos
 */
export function TrustScoreRequirementTooltip({
  requiredLevel,
  userLevel,
  userScore,
  requiredScore,
  categoryName,
  isBlocked = true,
  className = '',
}: TrustScoreRequirementTooltipProps) {
  const hasAccess = userLevel >= requiredLevel;
  const scoreDifference = requiredScore - userScore;
  const progressPercent = Math.min(100, (userScore / requiredScore) * 100);

  const getLevelName = (level: TrustScoreLevel): string => {
    switch (level) {
      case 0: return 'Basic';
      case 1: return 'Intermediate';
      case 2: return 'Advanced';
      case 3: return 'Elite';
      default: return 'Unknown';
    }
  };

  if (hasAccess) {
    return (
      <div
        className={`
          bg-green-500/10 border border-green-500/30 rounded-lg p-4
          ${className}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h4 className="font-bold text-green-300 mb-1">Access Granted</h4>
            <p className="text-sm text-gray-300">
              You have access to <strong>{categoryName}</strong> recipes.
            </p>
            <div className="mt-2 text-xs text-gray-400">
              Your Level: <span className="text-green-400 font-medium">{getLevelName(userLevel)}</span>
              {' '}({userScore}/1000)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-amber-500/10 border border-amber-500/30 rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-300 mb-1">Trust Score Required</h4>
          <p className="text-sm text-gray-300 mb-3">
            To access <strong>{categoryName}</strong> recipes, you need a higher Trust Score.
          </p>

          {/* Current vs Required */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-xs text-gray-400 mb-1">Your Score</div>
              <div className="text-lg font-bold text-white">{userScore}</div>
              <div className="text-xs text-gray-500">{getLevelName(userLevel)} Level</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <div className="text-xs text-gray-400 mb-1">Required</div>
              <div className="text-lg font-bold text-amber-400">{requiredScore}</div>
              <div className="text-xs text-gray-500">{getLevelName(requiredLevel)} Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Progress</span>
              <span className="text-amber-400 font-medium">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">
              You need <span className="text-amber-400 font-medium">{scoreDifference}</span> more points
            </div>
          </div>

          {/* How to Improve */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <p className="font-medium text-blue-300 mb-1">How to improve your Trust Score:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-400">
                  <li>Maintain regular activity</li>
                  <li>Complete forging & mining operations</li>
                  <li>Avoid suspicious behavior</li>
                  <li>Wait for oracle score updates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning si está bloqueado */}
          {isBlocked && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>This category is currently locked for your Trust Level</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
