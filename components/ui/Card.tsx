import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  return (
    <div className={`
      bg-white rounded-md border border-gray-200 shadow-soft
      transition-all duration-250
      ${hover ? 'hover:shadow-lg hover:border-gray-300' : ''}
      ${paddingStyles[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`text-xl font-semibold text-gray-900 tracking-tight ${className}`}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-secondary-600 mt-1.5 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
