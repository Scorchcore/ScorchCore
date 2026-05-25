'use client';

import { Shield, Award, Star, Crown, AlertCircle } from 'lucide-react';
import type { TrustScoreLevel } from '@/lib/contracts/interfaces/ITrustScoreContract';

interface TrustScoreBadgeProps {
  score: number;
  level: TrustScoreLevel;
  levelName: string;
  isFlagged?: boolean;
  isStale?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Badge que muestra el TrustScore del usuario
 * 
 * @pattern Presentation Component - Solo UI, sin lógica de negocio
 */
export function TrustScoreBadge({
  score,
  level,
  levelName,
  isFlagged = false,
  isStale = false,
  size = 'md',
  showLabel = true,
  className = '',
}: TrustScoreBadgeProps) {
  // Determinar color y icono según nivel
  const getLevelStyles = () => {
    if (isFlagged) {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/40',
        text: 'text-red-400',
        icon: AlertCircle,
      };
    }

    switch (level) {
      case 0: // Basic
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/40',
          text: 'text-gray-300',
          icon: Shield,
        };
      case 1: // Intermediate
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          icon: Award,
        };
      case 2: // Advanced
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          icon: Star,
        };
      case 3: // Elite
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          icon: Crown,
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/40',
          text: 'text-gray-300',
          icon: Shield,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          icon: 'w-3 h-3',
          text: 'text-xs',
          score: 'text-xs',
        };
      case 'lg':
        return {
          container: 'px-4 py-2',
          icon: 'w-6 h-6',
          text: 'text-base',
          score: 'text-lg',
        };
      default: // md
        return {
          container: 'px-3 py-1.5',
          icon: 'w-4 h-4',
          text: 'text-sm',
          score: 'text-sm',
        };
    }
  };

  const styles = getLevelStyles();
  const sizeStyles = getSizeStyles();
  const Icon = styles.icon;

  const displayText = isFlagged ? 'Flagged' : levelName;
  const displayScore = isFlagged ? '0' : score.toString();

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border
        ${styles.bg} ${styles.border}
        ${sizeStyles.container}
        ${isStale && !isFlagged ? 'opacity-60' : ''}
        ${className}
      `}
      title={
        isFlagged
          ? 'Account flagged - Trust Score reset to 0'
          : isStale
          ? 'Trust Score needs update'
          : `Trust Score: ${score}/1000 - ${levelName} Level`
      }
    >
      <Icon className={`${sizeStyles.icon} ${styles.text}`} />
      
      {showLabel && (
        <>
          <span className={`font-medium ${styles.text} ${sizeStyles.text}`}>
            {displayText}
          </span>
          <span className={`font-bold ${styles.text} ${sizeStyles.score}`}>
            {displayScore}
          </span>
        </>
      )}

      {!showLabel && (
        <span className={`font-bold ${styles.text} ${sizeStyles.score}`}>
          {displayScore}
        </span>
      )}

      {isStale && !isFlagged && (
        <div 
          className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
          title="Needs update"
        />
      )}
    </div>
  );
}
