'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by global error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Terjadi Kendala</h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {error.message || 'Sistem mengalami kendala saat memuat data. Silakan coba kembali.'}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => reset()}
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
