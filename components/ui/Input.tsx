import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  suffix?: string;
  error?: string;
  tooltip?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, suffix, error, tooltip, className, ...props }) => {
  return (
    <div className={`w-full group relative ${className || ''}`}>
      <div className="flex items-center gap-1 mb-2">
        <label className="block text-sm font-bold text-gray-900 dark:text-davys-gray">
          {label}
        </label>
        {tooltip && (
          <div className="relative group/tooltip">
            <div className="cursor-help text-gray-400 dark:text-davys-gray/60 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 dark:bg-davys-gray text-white text-[10px] rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50 text-center">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-davys-gray"></div>
            </div>
          </div>
        )}
      </div>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 dark:text-davys-gray sm:text-sm font-medium">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`block w-full rounded-lg border-0 py-2.5 sm:py-3 text-sm text-gray-900 dark:text-davys-gray bg-white dark:bg-davys-gray/5 ring-1 ring-inset ring-gray-400 dark:ring-davys-gray placeholder:text-gray-500 dark:placeholder:text-davys-gray/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 ${icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} transition-all shadow-sm`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-davys-gray sm:text-sm font-medium">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};