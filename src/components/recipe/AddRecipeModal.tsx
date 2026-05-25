/**
 * AddRecipeModal
 * 
 * Modal para agregar una nueva receta
 * 
 * @pattern Controlled Component
 */

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { RecipeCategory, MinerType, MINER_TYPE_NAMES, CATEGORY_NAMES } from '@/lib/contracts/interfaces/IRecipeRegistry';

export interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: number;
    minerType: number;
    minerIndex: number;
    maxSupply: bigint;
    isActive: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AddRecipeModal({
  isOpen,
  onClose,
  onSubmit,
}: AddRecipeModalProps) {
  const [category, setCategory] = useState<number>(RecipeCategory.COMMON);
  const [minerType, setMinerType] = useState<number>(MinerType.BEAST);
  const [minerIndex, setMinerIndex] = useState<number>(0);
  const [maxSupply, setMaxSupply] = useState<string>('100');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        category,
        minerType,
        minerIndex,
        maxSupply: BigInt(maxSupply),
        isActive,
      });

      if (result.success) {
        // Reset form
        setCategory(RecipeCategory.COMMON);
        setMinerType(MinerType.BEAST);
        setMinerIndex(0);
        setMaxSupply('100');
        setIsActive(true);
        onClose();
      } else {
        setError(result.error || 'Error al crear receta');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Nueva Receta">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[RecipeCategory.COMMON, RecipeCategory.RARE, RecipeCategory.EPIC].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  category === cat
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-white">
                    {CATEGORY_NAMES[cat as RecipeCategory]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Miner Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Miner
          </label>
          <select
            value={minerType}
            onChange={(e) => setMinerType(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          >
            {Object.entries(MINER_TYPE_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Miner Index */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Índice del Miner (0-99)
          </label>
          <input
            type="number"
            min="0"
            max="99"
            value={minerIndex}
            onChange={(e) => setMinerIndex(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            required
          />
        </div>

        {/* Max Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Supply Máximo
          </label>
          <input
            type="number"
            min="1"
            value={maxSupply}
            onChange={(e) => setMaxSupply(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            required
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-300">
            Activar receta inmediatamente
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Receta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
