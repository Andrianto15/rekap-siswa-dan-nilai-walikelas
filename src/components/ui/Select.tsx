import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, options = [], placeholder, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;
    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full min-h-[44px] appearance-none bg-white dark:bg-slate-900 border border-[#cbd5e1] dark:border-slate-700 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 transition duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#4682b4]/20 focus:border-[#4682b4] dark:focus:border-[#6ba3ce]',
              'disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-60 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer',
              error && 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-600',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="dark:bg-slate-900 dark:text-slate-400">
                {placeholder}
              </option>
            )}
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="dark:bg-slate-900 dark:text-slate-100">
                    {opt.label}
                  </option>
                ))}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
