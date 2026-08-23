'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: 'trash' | 'warning' | 'info' | 'alert';
}

type ConfirmFunction = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { message: '' },
  });

  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFunction>((options) => {
    return new Promise<boolean>((resolve) => {
      const normalizedOptions: ConfirmOptions =
        typeof options === 'string'
          ? {
              title: 'Konfirmasi',
              message: options,
              variant: 'danger',
              confirmText: 'Ya, Lanjutkan',
              cancelText: 'Batal',
            }
          : {
              title: options.title || 'Konfirmasi',
              message: options.message,
              confirmText: options.confirmText || (options.variant === 'primary' ? 'Simpan' : 'Ya, Hapus'),
              cancelText: options.cancelText || 'Batal',
              variant: options.variant || 'danger',
              icon: options.icon,
            };

      setDialogState({
        isOpen: true,
        options: normalizedOptions,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      setDialogState((prev) => {
        if (prev.resolve) {
          prev.resolve(result);
        }
        return { ...prev, isOpen: false, resolve: undefined };
      });
    },
    []
  );

  useEffect(() => {
    if (dialogState.isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto focus confirm button for convenience & keyboard navigation
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [dialogState.isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogState.isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen, handleClose]);

  const { options, isOpen } = dialogState;
  const variant = options.variant || 'danger';

  // Render variant-based icon badge
  const renderIcon = () => {
    if (options.icon === 'trash' || (variant === 'danger' && !options.icon)) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner ring-8 ring-rose-50 shrink-0">
          <Trash2 className="w-6 h-6" />
        </div>
      );
    }
    if (options.icon === 'warning' || variant === 'warning') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner ring-8 ring-amber-50 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
      );
    }
    if (options.icon === 'alert') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner ring-8 ring-rose-50 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner ring-8 ring-blue-50 shrink-0">
        <Info className="w-6 h-6" />
      </div>
    );
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur & smooth fade */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => handleClose(false)}
            aria-hidden="true"
          />

          {/* Dialog Modal */}
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6"
          >
            {/* Close X button top right */}
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {renderIcon()}

              <div className="flex-1 min-w-0">
                <h3
                  id="confirm-dialog-title"
                  className="text-lg font-bold text-slate-900 leading-tight"
                >
                  {options.title}
                </h3>
                <div
                  id="confirm-dialog-desc"
                  className="mt-2 text-sm text-slate-600 leading-relaxed"
                >
                  {options.message}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="w-full sm:w-auto font-medium"
              >
                {options.cancelText}
              </Button>
              <Button
                ref={confirmBtnRef}
                type="button"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={() => handleClose(true)}
                className="w-full sm:w-auto font-semibold shadow-sm"
              >
                {options.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
