/**
 * Barrel export para Recipe service
 */

export { RecipeService, createRecipeService } from "./RecipeService";
export type { RecipeFilters, RecipeStats } from "./RecipeService";

// Re-export types from IRecipeRegistry
export type { RecipeInfo } from "@/lib/contracts/interfaces/IRecipeRegistry";
export type { Recipe } from "@/lib/contracts/interfaces/SharedTypes";
