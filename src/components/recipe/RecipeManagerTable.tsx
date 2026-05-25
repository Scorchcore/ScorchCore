/**
 * RecipeManagerTable
 *
 * Tabla para gestionar recetas con acciones admin
 *
 * @pattern Presentation Component
 */

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";
import type { RecipeInfo } from "@/lib/services/recipe";
import { MINER_TYPE_EMOJIS } from "@/lib/contracts/interfaces/IRecipeRegistry";

export interface RecipeManagerTableProps {
  recipes: RecipeInfo[];
  onToggle: (recipe: RecipeInfo) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export function RecipeManagerTable({
  recipes,
  onToggle,
  onRefresh,
  isLoading = false,
}: RecipeManagerTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredRecipes = recipes.filter((recipe) => {
    if (filter === "active") return recipe.enabled;
    if (filter === "inactive") return !recipe.enabled;
    return true;
  });

  const handleToggle = async (recipe: RecipeInfo) => {
    setTogglingId(recipe.id.toString());
    try {
      await onToggle(recipe);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recetas Configuradas</h2>
          <div className="flex items-center gap-3">
            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Todas ({recipes.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "active"
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Activas ({recipes.filter((r) => r.enabled).length})
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "inactive"
                    ? "bg-orange-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Inactivas ({recipes.filter((r) => !r.enabled).length})
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              🔄 Recargar
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Receta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Supply
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredRecipes.map((recipe) => (
              <tr
                key={recipe.id}
                className="hover:bg-slate-700/50 transition-colors"
              >
                {/* ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400 font-mono">
                    {recipe.id}
                  </span>
                </td>

                {/* Recipe Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {
                        MINER_TYPE_EMOJIS[
                          recipe.minerType as keyof typeof MINER_TYPE_EMOJIS
                        ]
                      }
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {recipe.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipe.typeName} #{recipe.minerIndex}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      recipe.category === 0
                        ? "default"
                        : recipe.category === 1
                          ? "info"
                          : "success"
                    }
                    className="text-xs"
                  >
                    {recipe.categoryName}
                  </Badge>
                </td>

                {/* Supply */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="text-white font-medium">
                      {recipe.maxSupply.toString()}
                    </div>
                    <div className="text-xs text-gray-500">Max supply</div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={recipe.enabled ? "success" : "default"}
                    className="text-xs"
                  >
                    {recipe.enabled ? "✅ Activa" : "⚠️ Inactiva"}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button
                    variant={recipe.enabled ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggle(recipe)}
                    disabled={togglingId === recipe.id.toString() || isLoading}
                    className="text-xs"
                  >
                    {togglingId === recipe.id.toString()
                      ? "⏳"
                      : recipe.enabled
                        ? "Desactivar"
                        : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg">
            {filter === "all"
              ? "No hay recetas configuradas"
              : `No hay recetas ${filter === "active" ? "activas" : "inactivas"}`}
          </p>
        </div>
      )}
    </div>
  );
}
