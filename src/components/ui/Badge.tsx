import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'sakit' | 'izin' | 'alpa' | 'hadir' | 'dispen';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-[#4682b4]/10 text-[#4682b4] border-[#4682b4]/20',
    sakit: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    izin: 'bg-sky-100 text-sky-800 border-sky-300 font-bold',
    alpa: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    hadir: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    dispen: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
