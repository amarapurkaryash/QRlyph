import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-primary text-on-primary focus-visible:ring-accent',
    secondary: 'bg-surface text-text-main hover:bg-border/60 focus-visible:ring-accent',
    ghost: 'bg-transparent text-text-subtle hover:bg-surface hover:text-text-main focus-visible:ring-accent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 -ml-1 h-5 w-5">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;