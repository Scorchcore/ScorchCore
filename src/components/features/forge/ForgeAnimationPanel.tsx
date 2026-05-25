'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';
import { Modal, Button } from '@/components/ui';
import { GeodeVideo } from '@/components/GeodeVideo';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('ForgeAnimationPanel');

export type ForgeStage = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'success' | 'fail';

interface ForgeAnimationPanelProps {
  // Estado actual de la forja
  stage: ForgeStage;
  
  // Datos de la geoda seleccionada (para mostrar en éxito)
  selectedCategory?: GeodeCategory;
  selectedClass?: AxieClass;
  forgedGeodeId?: bigint | null;
  
  // Callbacks
  onStageComplete?: (stage: ForgeStage) => void;
  onSuccessModalClose?: () => void;
  onFailModalClose?: () => void;
  
  // Props opcionales
  className?: string;
}

/**
 * Componente que maneja la animación de forja con videos
 * Controla las transiciones entre stages y muestra modales de resultado
 */
export function ForgeAnimationPanel({
  stage,
  selectedCategory,
  selectedClass,
  forgedGeodeId,
  onStageComplete,
  onSuccessModalClose,
  onFailModalClose,
  className = ''
}: ForgeAnimationPanelProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  // Mapeo de stages a archivos de video
  const getVideoPath = (currentStage: ForgeStage): string => {
    switch (currentStage) {
      case 'stage1':
        return '/forge-videos/forge-stage-1.mp4';
      case 'stage2':
        return '/forge-videos/forge-stage2.mp4';
      case 'stage3':
        return '/forge-videos/forge-stage-3.mp4';
      case 'stage4':
        return '/forge-videos/forge-stage-4.mp4';
      case 'fail':
        return '/forge-videos/forge-stage-fail.mp4';
      default:
        return '/forge-videos/forge-stage-1.mp4';
    }
  };

  // Determinar si el video debe hacer loop
  const shouldLoop = (currentStage: ForgeStage): boolean => {
    // Stage 1, 2, 3 hacen loop esperando acción del usuario
    // Stage 4 y fail se reproducen una vez
    return ['stage1', 'stage2', 'stage3'].includes(currentStage);
  };

  // Manejar cambio de stage con transición suave
  useEffect(() => {
    if (!videoRef.current) return;

    setIsTransitioning(true);
    
    // Pequeña pausa para transición suave
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [stage]);

  // Manejar fin de video para stages que no hacen loop
  const handleVideoEnded = () => {
    if (stage === 'stage4') {
      // Stage 4 terminó, esperar resultado de la blockchain
      onStageComplete?.(stage);
    } else if (stage === 'fail') {
      // Video de fallo terminó, mostrar modal
      setShowFailModal(true);
    }
  };

  // Manejar éxito de forja
  useEffect(() => {
    if (stage === 'success' && forgedGeodeId) {
      setShowSuccessModal(true);
    }
  }, [stage, forgedGeodeId]);

  // Cerrar modal de éxito
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccessModalClose?.();
  };

  // Cerrar modal de fallo
  const handleFailModalClose = () => {
    setShowFailModal(false);
    onFailModalClose?.();
  };

  return (
    <>
      {/* Panel de Video de Forja */}
      <div className={`relative overflow-hidden rounded-lg bg-black/40 ${className}`}>
        {/* Overlay de transición */}
        {isTransitioning && (
          <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Video de Forja */}
        <video
          ref={videoRef}
          key={`forge-${stage}`}
          autoPlay
          loop={shouldLoop(stage)}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-contain"
          onEnded={handleVideoEnded}
          onError={(e) => {
            log.error('Failed to load forge animation video', undefined, { 
              stage, 
              videoPath: getVideoPath(stage) 
            });
          }}
        >
          <source src={getVideoPath(stage)} type="video/mp4" />
        </video>

        {/* Overlay con información del stage */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
          <div className="text-white text-sm">
            {stage === 'stage1' && '🔥 Selecciona una categoría de geoda'}
            {stage === 'stage2' && '⚡ Selecciona una clase de Axie'}
            {stage === 'stage3' && '💎 Listo para forjar'}
            {stage === 'stage4' && '🔨 Forjando...'}
            {stage === 'fail' && '💥 Forja fallida'}
          </div>
        </div>
      </div>

      {/* Modal de Éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="🎉 ¡Forja Exitosa!"
        size="lg"
      >
        <div className="text-center space-y-6">
          {/* Video de la geoda forjada */}
          {selectedCategory !== undefined && selectedClass !== undefined && (
            <div className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden">
              <GeodeVideo
                category={selectedCategory}
                axieClass={selectedClass}
                className="w-full h-full"
                autoPlay={true}
              />
            </div>
          )}

          {/* Información de la geoda */}
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              ¡Geoda Forjada con Éxito!
            </h3>
            {forgedGeodeId && (
              <p className="text-gray-400">
                Token ID: #{forgedGeodeId.toString()}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => {
                handleSuccessModalClose();
                // Navegar al inventario usando Next.js router
                router.push('/inventory');
              }}
            >
              Ver en Inventario
            </Button>
            <Button
              variant="secondary"
              onClick={handleSuccessModalClose}
            >
              Forjar Otra
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Fallo */}
      <Modal
        isOpen={showFailModal}
        onClose={handleFailModalClose}
        title="💥 Forja Fallida"
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">😞</div>
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              La forja ha fallado
            </h3>
            <p className="text-gray-400">
              Los recursos fueron consumidos debido al RNG.
              ¡Inténtalo de nuevo!
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={handleFailModalClose}
            fullWidth
          >
            Intentar de Nuevo
          </Button>
        </div>
      </Modal>
    </>
  );
}
