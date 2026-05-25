/**
 * MinerComparisonTable
 * 
 * Tabla para comparar estadísticas de múltiples miners
 * con ranking y promedios
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import type { MinerComparison } from '@/lib/services/minerstats';

export interface MinerComparisonTableProps {
  comparisons: MinerComparison[];
  averages?: {
    avgDurability: number;
    avgEfficiency: number;
    avgLevel: number;
    avgMultiplier: number;
    totalExperience: number;
  } | null;
  className?: string;
}

/**
 * Obtiene color del ranking
 */
function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-gray-500';
}

/**
 * Obtiene ícono del ranking
 */
function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/**
 * Tabla de comparación de miners
 */
export function MinerComparisonTable({
  comparisons,
  averages,
  className = '',
}: MinerComparisonTableProps) {
  if (comparisons.length === 0) {
    return (
      <div className={`bg-slate-800 rounded-lg border border-slate-700 p-8 text-center ${className}`}>
        <p className="text-gray-400">No hay miners para comparar</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Comparación de Miners
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {comparisons.length} miners • Ordenados por rendimiento
            </p>
          </div>
          
          {averages && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">
                Promedio: <span className="text-white font-medium">{averages.avgMultiplier}x</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Miner ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Durabilidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Eficiencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Experiencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Multiplicador
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {comparisons.map((comp) => (
              <tr
                key={comp.minerId.toString()}
                className="hover:bg-slate-700/50 transition-colors"
              >
                {/* Rank */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-lg font-bold ${getRankColor(comp.rank)}`}>
                    {getRankIcon(comp.rank)}
                  </span>
                </td>

                {/* Miner ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">
                    #{comp.minerId.toString()}
                  </span>
                </td>

                {/* Durability */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${comp.durability}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{comp.durability}%</span>
                  </div>
                </td>

                {/* Efficiency */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${comp.efficiency}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{comp.efficiency}%</span>
                  </div>
                </td>

                {/* Level */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-400">
                    Lv.{comp.level}
                  </span>
                </td>

                {/* Experience */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    {comp.experience.toLocaleString()} XP
                  </span>
                </td>

                {/* Multiplier */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-green-400">
                    {comp.effectiveMultiplier.toFixed(1)}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Averages Footer */}
      {averages && (
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Promedio Durabilidad</div>
              <div className="text-lg font-bold text-blue-400">{averages.avgDurability}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Promedio Eficiencia</div>
              <div className="text-lg font-bold text-purple-400">{averages.avgEfficiency}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Promedio Nivel</div>
              <div className="text-lg font-bold text-white">Lv.{averages.avgLevel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Promedio Multiplicador</div>
              <div className="text-lg font-bold text-green-400">{averages.avgMultiplier}x</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Experiencia Total</div>
              <div className="text-lg font-bold text-yellow-400">
                {averages.totalExperience.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
