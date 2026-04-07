import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-indigo-700 focus:ring-primary shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500",
    secondary: "bg-secondary text-white hover:bg-emerald-600 focus:ring-secondary shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary dark:bg-smoke-gray dark:text-silver-gray dark:border-davys-gray dark:hover:bg-davys-gray/10",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm dark:bg-red-700 dark:hover:bg-red-600"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {icon && <span className="mr-2 inline-flex">{icon}</span>}
      {children}
    </button>
  );
};