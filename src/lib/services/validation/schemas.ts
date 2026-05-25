/**
 * Zod Validation Schemas
 * 
 * Schemas de validación para inputs de servicios
 * Garantiza type safety y validación en runtime
 * 
 * @pattern Validation
 */

import { z } from 'zod';
import { isAddress } from 'viem';

// ==========================================
// Schemas Básicos
// ==========================================

/**
 * Schema para Address (0x...)
 */
export const AddressSchema = z
  .string()
  .refine((val) => isAddress(val), {
    message: 'Invalid Ethereum address format',
  })
  .transform((val) => val as `0x${string}`);

/**
 * Schema para BigInt positivo
 */
export const PositiveBigIntSchema = z
  .bigint()
  .positive('Value must be positive');

/**
 * Schema para número de token ID
 */
export const TokenIdSchema = z
  .bigint()
  .nonnegative('Token ID must be non-negative');

/**
 * Schema para cantidades de tokens
 */
export const TokenAmountSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, 'Invalid token amount format')
  .refine((val) => parseFloat(val) >= 0, {
    message: 'Amount must be non-negative',
  });

// ==========================================
// Schemas de Forge
// ==========================================

/**
 * Schema para GeodeType
 */
export const GeodeTypeSchema = z.enum([
  'PETIT',
  'ALTO',
  'ANIMAL',
  'ULTRAMECH',
  'TANQUE',
]);

/**
 * Schema para TokenType
 */
export const TokenTypeSchema = z.enum(['axs', 'slp', 'memento']);

/**
 * Schema para aprobación de token
 */
export const ApproveTokenInputSchema = z.object({
  tokenType: TokenTypeSchema,
  amount: TokenAmountSchema,
});

/**
 * Schema para aprobar todos los tokens
 */
export const ApproveAllTokensInputSchema = z.object({
  geodeType: GeodeTypeSchema,
  mementosExtra: z.number().int().nonnegative().default(0),
});

/**
 * Schema para verificar aprobaciones
 */
export const CheckApprovalsInputSchema = z.object({
  userAddress: AddressSchema,
  geodeType: GeodeTypeSchema,
  mementosExtra: z.number().int().nonnegative().default(0),
});

/**
 * Schema para forjar receta
 */
export const ForgeRecipeInputSchema = z.object({
  recipeId: z.number().int().positive('Recipe ID must be positive'),
  materials: z.array(
    z.object({
      tokenAddress: AddressSchema,
      amount: PositiveBigIntSchema,
    })
  ).min(1, 'At least one material required'),
});

/**
 * Schema para eclosionar geoda
 */
export const HatchGeodeInputSchema = z.object({
  geodeId: TokenIdSchema,
});

// ==========================================
// Schemas de Mining
// ==========================================

/**
 * Schema para iniciar mining
 */
export const StartMiningInputSchema = z.object({
  minerId: TokenIdSchema,
  power: PositiveBigIntSchema,
  efficiency: PositiveBigIntSchema.refine(
    (val) => val <= 100n,
    'Efficiency cannot exceed 100%'
  ),
});

/**
 * Schema para detener mining
 */
export const StopMiningInputSchema = z.object({
  minerId: TokenIdSchema,
});

/**
 * Schema para claim de rewards
 */
export const ClaimRewardsInputSchema = z.object({
  minerId: TokenIdSchema,
});

/**
 * Schema para alimentar minero
 */
export const FeedMinerInputSchema = z.object({
  minerId: TokenIdSchema,
});

/**
 * Schema para estimar rewards
 */
export const EstimateRewardsInputSchema = z.object({
  power: PositiveBigIntSchema,
  efficiency: PositiveBigIntSchema.refine(
    (val) => val <= 100n,
    'Efficiency cannot exceed 100%'
  ),
  hours: z.number().positive('Hours must be positive').optional(),
});

/**
 * Schema para obtener sesiones activas
 */
export const GetActiveSessionsInputSchema = z.object({
  userAddress: AddressSchema,
  minerIds: z.array(TokenIdSchema).optional(),
});

// ==========================================
// Helper para validación
// ==========================================

/**
 * Valida input y lanza error descriptivo si falla
 * 
 * @param schema - Schema de Zod
 * @param data - Datos a validar
 * @returns Datos validados y transformados
 * @throws Error con mensajes descriptivos si falla validación
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');

    throw new Error(`Validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Valida input y retorna resultado con success flag
 * No lanza error, útil para validaciones opcionales
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
