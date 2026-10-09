'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'নিশ্চিত করুন',
  cancelText = 'বাতিল করুন',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !isLoading && onCancel()}
        className="fixed inset-0 bg-[#050D24]/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md bg-[#071333] border border-[#1d3575] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 z-10 space-y-5 animate-in zoom-in-95 duration-200 text-white">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <button
            onClick={() => !isLoading && onCancel()}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white leading-snug">{title}</h3>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-[0.98] ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-[#F26522] hover:bg-[#F9A01B] text-white shadow-lg shadow-[#F26522]/30'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>অপেক্ষা করুন...</span>
              </>
            ) : (
              <>
                {isDestructive && <Trash2 className="w-4 h-4" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
