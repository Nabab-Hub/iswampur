'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    show: (message: string, type?: ToastType, title?: string, duration?: number) => void;
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      show(message, 'success', title, duration);
    },
    [show]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      show(message, 'error', title, duration);
    },
    [show]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      show(message, 'warning', title, duration);
    },
    [show]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      show(message, 'info', title, duration);
    },
    [show]
  );

  return (
    <ToastContext.Provider value={{ toast: { show, success, error, warning, info } }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              border: 'border-emerald-500/40',
              bg: 'bg-[#06181b]/95 dark:bg-[#06181b]/95',
              glow: 'shadow-emerald-500/10',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
              badgeBg: 'bg-emerald-500/20 text-emerald-300',
              progress: 'bg-emerald-500',
            },
            error: {
              border: 'border-rose-500/40',
              bg: 'bg-[#1a070e]/95 dark:bg-[#1a070e]/95',
              glow: 'shadow-rose-500/15',
              icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
              badgeBg: 'bg-rose-500/20 text-rose-300',
              progress: 'bg-rose-500',
            },
            warning: {
              border: 'border-amber-500/40',
              bg: 'bg-[#1c1305]/95 dark:bg-[#1c1305]/95',
              glow: 'shadow-amber-500/15',
              icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
              badgeBg: 'bg-amber-500/20 text-amber-300',
              progress: 'bg-amber-500',
            },
            info: {
              border: 'border-[#19398A]/60',
              bg: 'bg-[#071333]/95 dark:bg-[#071333]/95',
              glow: 'shadow-[#00A3E0]/15',
              icon: <Info className="w-5 h-5 text-[#00A3E0] shrink-0" />,
              badgeBg: 'bg-[#19398A]/40 text-[#00A3E0]',
              progress: 'bg-[#00A3E0]',
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border ${typeConfig.border} ${typeConfig.bg} backdrop-blur-xl shadow-2xl ${typeConfig.glow} p-4 transition-all animate-in slide-in-from-top-4 duration-200 flex items-start gap-3 text-white`}
            >
              <div className="mt-0.5">{typeConfig.icon}</div>
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className="text-sm font-black text-white leading-snug mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-200 font-medium leading-relaxed break-words">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
