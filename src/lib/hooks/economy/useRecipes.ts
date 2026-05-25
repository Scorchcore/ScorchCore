/**
 * useRecipes Hook
 * 
 * Hook para gestionar recetas de forja con queries y mutations
 * 
 * @pattern Custom Hook Pattern (React)
 * @pattern Observer Pattern - Auto-refresh opcional
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import { RecipeService, type RecipeInfo, type RecipeFilters, type RecipeStats } from '@/lib/services/recipe';

/**
 * Estado del hook useRecipes
 */
export interface UseRecipesReturn {
  // Datos
  recipes: RecipeInfo[];
  stats: RecipeStats | null;
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Acciones de query
  refresh: () => Promise<void>;
  getRecipe: (category: number, minerType: number, minerIndex: number) => Promise<RecipeInfo | null>;
  
  // Acciones de mutation (admin)
  setRecipe: (
    category: number,
    minerType: number,
    minerIndex: number,
    maxSupply: bigint,
    isActive?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  
  toggleRecipe: (
    category: number,
    minerType: number,
    minerIndex: number,
    isActive: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  
  batchSetRecipes: (
    recipes: Array<{
      category: number;
      minerType: number;
      minerIndex: number;
      maxSupply: bigint;
    }>
  ) => Promise<{ success: boolean; error?: string }>;
  
  // Estado de operaciones
  isSaving: boolean;
}

/**
 * Hook para gestionar recetas de forja
 * 
 * @param filters - Filtros opcionales para recetas
 * @param autoRefresh - Si debe auto-refrescar (default: false)
 * @param refreshInterval - Intervalo de refresh en ms (default: 60000)
 * 
 * @example
 * ```tsx
 * function RecipesList() {
 *   const { recipes, isLoading, refresh } = useRecipes();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       {recipes.map(recipe => (
 *         <div key={recipe.id}>{recipe.displayName}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRecipes(
  filters?: RecipeFilters,
  autoRefresh: boolean = false,
  refreshInterval: number = 60000
): UseRecipesReturn {
  const { contractManager } = useContractManager();
  
  const [recipes, setRecipes] = useState<RecipeInfo[]>([]);
  const [stats, setStats] = useState<RecipeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga todas las recetas
   */
  const loadRecipes = useCallback(async () => {
    if (!contractManager) {
      setRecipes([]);
      setStats(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new RecipeService(contractManager);
      
      const [allRecipes, recipeStats] = await Promise.all([
        service.getAllRecipes(filters),
        service.getStats(),
      ]);

      setRecipes(allRecipes);
      setStats(recipeStats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading recipes');
      setError(error);
      console.error('Error in useRecipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager, filters]);

  /**
   * Obtiene una receta específica
   */
  const getRecipe = useCallback(async (
    category: number,
    minerType: number,
    minerIndex: number
  ): Promise<RecipeInfo | null> => {
    if (!contractManager) return null;

    try {
      const service = new RecipeService(contractManager);
      return await service.getRecipe(category, minerType, minerIndex);
    } catch (err) {
      console.error('Error getting recipe:', err);
      return null;
    }
  }, [contractManager]);

  /**
   * Crea o actualiza una receta
   */
  const setRecipe = useCallback(async (
    category: number,
    minerType: number,
    minerIndex: number,
    maxSupply: bigint,
    isActive: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    if (!contractManager) {
      return { success: false, error: 'Contract manager not available' };
    }

    try {
      setIsSaving(true);
      const service = new RecipeService(contractManager);
      const result = await service.setRecipe(category, minerType, minerIndex, maxSupply, isActive);
      
      if (result.success) {
        // Recargar recetas después de crear/actualizar
        await loadRecipes();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      setIsSaving(false);
    }
  }, [contractManager, loadRecipes]);

  /**
   * Activa o desactiva una receta
   */
  const toggleRecipe = useCallback(async (
    category: number,
    minerType: number,
    minerIndex: number,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (!contractManager) {
      return { success: false, error: 'Contract manager not available' };
    }

    try {
      setIsSaving(true);
      const service = new RecipeService(contractManager);
      const result = await service.toggleRecipe(category, minerType, minerIndex, isActive);
      
      if (result.success) {
        // Recargar recetas después de toggle
        await loadRecipes();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      setIsSaving(false);
    }
  }, [contractManager, loadRecipes]);

  /**
   * Crea múltiples recetas en batch
   */
  const batchSetRecipes = useCallback(async (
    recipes: Array<{
      category: number;
      minerType: number;
      minerIndex: number;
      maxSupply: bigint;
    }>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!contractManager) {
      return { success: false, error: 'Contract manager not available' };
    }

    try {
      setIsSaving(true);
      const service = new RecipeService(contractManager);
      const result = await service.batchSetRecipes(recipes);
      
      if (result.success) {
        // Recargar recetas después de batch
        await loadRecipes();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    } finally {
      setIsSaving(false);
    }
  }, [contractManager, loadRecipes]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadRecipes();
  }, [loadRecipes]);

  // Cargar datos iniciales
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !contractManager) return;

    const interval = setInterval(() => {
      loadRecipes();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, contractManager, loadRecipes]);

  return {
    recipes,
    stats,
    isLoading,
    error,
    refresh,
    getRecipe,
    setRecipe,
    toggleRecipe,
    batchSetRecipes,
    isSaving,
  };
}

/**
 * Hook simplificado para verificar rol de admin
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { isAdmin, isLoading } = useAdminRole();
 *   
 *   if (isLoading) return <Loading />;
 *   if (!isAdmin) return <div>Access denied</div>;
 *   
 *   return <RecipeManager />;
 * }
 * ```
 */
export function useAdminRole() {
  const { contractManager } = useContractManager();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!contractManager) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Obtener la dirección del usuario conectado
        const signer = contractManager.getSigner();
        if (!signer) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const address = await signer.getAddress();
        const service = new RecipeService(contractManager);
        const adminStatus = await service.isAdmin(address as `0x${string}`);
        
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminRole();
  }, [contractManager]);

  return { isAdmin, isLoading };
}
