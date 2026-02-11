import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  suffix?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, suffix, error, className, ...props }) => {
  return (
    <div className={`w-full ${className || ''}`}>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm font-medium">{icon}</span>
          </div>
        )}
        <input
          {...props}
          className={`block w-full rounded-lg border-0 py-3 text-gray-900 bg-white ring-1 ring-inset ring-gray-400 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 ${icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} transition-all shadow-sm`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm font-medium">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};