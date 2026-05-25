/**
 * Hook para manejar los stages de animación de forja
 */

import { useState, useEffect } from 'react';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';

export type ForgeStage = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'success' | 'fail';
export type ForgeStep = 'select' | 'approve' | 'forge' | 'success';

interface UseForgeStageProps {
  forgeStep: ForgeStep;
  selectedCategory: GeodeCategory | undefined;
  selectedClass: AxieClass | undefined;
  mementosToUse: number;
  isForging: boolean;
  forgedGeodeId: bigint | null;
  forgeFailed?: boolean;
}

export function useForgeStage({
  forgeStep,
  selectedCategory,
  selectedClass,
  mementosToUse,
  isForging,
  forgedGeodeId,
  forgeFailed = false
}: UseForgeStageProps) {
  const [currentStage, setCurrentStage] = useState<ForgeStage>('stage1');

  // Mapear forgeStep a stage de animación
  useEffect(() => {
    if (forgeFailed) {
      setCurrentStage('fail');
      return;
    }

    if (forgedGeodeId) {
      setCurrentStage('success');
      return;
    }

    if (isForging) {
      setCurrentStage('stage4');
      return;
    }

    switch (forgeStep) {
      case 'select':
        // Stage 1: No ha seleccionado categoría
        if (selectedCategory === undefined) {
          setCurrentStage('stage1');
        }
        // Stage 2: Seleccionó categoría pero no clase
        else if (selectedClass === undefined) {
          setCurrentStage('stage2');
        }
        // Stage 3: Seleccionó ambos (categoría y clase)
        else {
          setCurrentStage('stage3');
        }
        break;
      
      case 'approve':
      case 'forge':
        // Ya seleccionó todo, esperando aprobación/forja
        setCurrentStage('stage3');
        break;
      
      case 'success':
        setCurrentStage('success');
        break;
    }
  }, [forgeStep, selectedCategory, selectedClass, mementosToUse, isForging, forgedGeodeId, forgeFailed]);

  // Función para resetear a stage inicial
  const resetToStage1 = () => {
    setCurrentStage('stage1');
  };

  // Función para avanzar manualmente (si es necesario)
  const advanceStage = () => {
    switch (currentStage) {
      case 'stage1':
        setCurrentStage('stage2');
        break;
      case 'stage2':
        setCurrentStage('stage3');
        break;
      case 'stage3':
        setCurrentStage('stage4');
        break;
    }
  };

  return {
    currentStage,
    resetToStage1,
    advanceStage,
    
    // Estados derivados útiles
    isWaitingForUser: ['stage1', 'stage2', 'stage3'].includes(currentStage),
    isForging: currentStage === 'stage4',
    isComplete: ['success', 'fail'].includes(currentStage),
  };
}
