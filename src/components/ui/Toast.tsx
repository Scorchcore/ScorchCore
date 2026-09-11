import React from "react";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastTimer = ReturnType<typeof setTimeout> | null;

export function getDefaultToastDuration(type: ToastType): number {
  return type === "error" ? 0 : 5000;
}

export function replaceToastTimer(
  currentTimer: ToastTimer,
  duration: number,
  onDismiss: () => void,
): ToastTimer {
  if (currentTimer) clearTimeout(currentTimer);
  return duration > 0 ? setTimeout(onDismiss, duration) : null;
}

interface ToastProps {
  type: ToastType;
  message: string;
  title?: string;
  onClose?: () => void;
}

export function Toast({ type, message, title, onClose }: ToastProps) {
  const [copied, setCopied] = React.useState(false);
  const typeStyles = {
    success: "bg-green-500/20 border-green-500 text-green-500",
    error: "bg-red-500/20 border-red-500 text-red-500",
    info: "bg-blue-500/20 border-blue-500 text-blue-500",
    warning: "bg-yellow-500/20 border-yellow-500 text-yellow-500",
  };

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border-2 backdrop-blur-sm ${typeStyles[type]} 
        animate-in slide-in-from-bottom-5 duration-300 max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icons[type]}</div>
        <div className="min-w-0 flex-1">
          {title && <div className="mb-1 font-bold">{title}</div>}
          <div className="break-words text-sm text-white/90">{message}</div>
          {type === "error" && (
            <button
              type="button"
              onClick={copyMessage}
              className="mt-3 rounded border border-white/25 px-2 py-1 text-xs text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              {copied ? "Copied" : "Copy error"}
            </button>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="text-white/60 transition-colors hover:text-white"
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
  const timeoutRef = React.useRef<ToastTimer>(null);
  const [toast, setToast] = React.useState<{
    type: ToastType;
    message: string;
    title?: string;
  } | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showToast = (
    type: ToastType,
    message: string,
    title?: string,
    duration = getDefaultToastDuration(type),
  ) => {
    setToast({ type, message, title });
    timeoutRef.current = replaceToastTimer(timeoutRef.current, duration, () =>
      setToast(null),
    );
  };

  const hideToast = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string, title?: string) =>
      showToast("success", message, title),
    showError: (message: string, title?: string) =>
      showToast("error", message, title),
    showInfo: (message: string, title?: string) =>
      showToast("info", message, title),
    showWarning: (message: string, title?: string) =>
      showToast("warning", message, title),
  };
}
