'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ConvertfCoreButtonProps {
  onConvert: (amount?: bigint) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
  className?: string;
  variant?: 'full' | 'compact';
}

/**
 * Botón para convertir fCORE a CORE
 */
export function ConvertfCoreButton({
  onConvert,
  disabled = false,
  className = '',
  variant = 'full',
}: ConvertfCoreButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConvert = async () => {
    setIsConverting(true);
    setResult(null);

    try {
      const res = await onConvert();
      
      if (res.success) {
        setResult({
          success: true,
          message: '¡fCORE convertido exitosamente!',
        });
        
        setTimeout(() => setResult(null), 3000);
      } else {
        setResult({
          success: false,
          message: res.error || 'Error al convertir fCORE',
        });
        
        setTimeout(() => setResult(null), 5000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
      
      setTimeout(() => setResult(null), 5000);
    } finally {
      setIsConverting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleConvert}
        disabled={disabled || isConverting}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            disabled || isConverting
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
          ${className}
        `}
      >
        {isConverting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Convirtiendo...</span>
          </>
        ) : result ? (
          <>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={result.success ? 'text-green-300' : 'text-red-300'}>
              {result.message}
            </span>
          </>
        ) : (
          <>
            <span>Convertir</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConvert}
        disabled={disabled || isConverting}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold
          transition-all duration-200
          ${
            disabled || isConverting
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
          }
          ${className}
        `}
      >
        {isConverting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Convirtiendo fCORE...</span>
          </>
        ) : (
          <>
            <span>Convertir Todo a CORE</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {result && (
        <div
          className={`
            flex items-center gap-2 p-3 rounded-lg border
            ${
              result.success
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }
          `}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{result.message}</span>
        </div>
      )}
    </div>
  );
}
