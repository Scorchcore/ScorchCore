import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  title?: string;
  onClose?: () => void;
}

export function Toast({ type, message, title, onClose }: ToastProps) {
  const typeStyles = {
    success: 'bg-green-500/20 border-green-500 text-green-500',
    error: 'bg-red-500/20 border-red-500 text-red-500',
    info: 'bg-blue-500/20 border-blue-500 text-blue-500',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border-2 backdrop-blur-sm ${typeStyles[type]} 
        animate-in slide-in-from-bottom-5 duration-300 max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icons[type]}</div>
        <div className="flex-1">
          {title && <div className="font-bold mb-1">{title}</div>}
          <div className="text-sm text-white/90">{message}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Hook para usar toast
export function useToast() {
  const [toast, setToast] = React.useState<{
    type: ToastType;
    message: string;
    title?: string;
  } | null>(null);

  const showToast = (
    type: ToastType,
    message: string,
    title?: string,
    duration: number = 5000
  ) => {
    setToast({ type, message, title });
    if (duration > 0) {
      setTimeout(() => setToast(null), duration);
    }
  };

  const hideToast = () => setToast(null);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string, title?: string) =>
      showToast('success', message, title),
    showError: (message: string, title?: string) =>
      showToast('error', message, title),
    showInfo: (message: string, title?: string) =>
      showToast('info', message, title),
    showWarning: (message: string, title?: string) =>
      showToast('warning', message, title),
  };
}
