'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const titleId = title ? 'modal-title' : undefined;
  const descId = description ? 'modal-desc' : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box with Modal Float elevation and hairline border */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-xl shadow-modal border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200',
          maxWidths[maxWidth]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              {title && <h3 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
              {description && <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
