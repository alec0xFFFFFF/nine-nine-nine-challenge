'use client';

import { HTMLAttributes } from 'react';
import Container from './Container';

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'masters';
}

export default function PageHeader({
  title,
  description,
  actions,
  variant = 'default',
  className = '',
  ...props
}: PageHeaderProps) {
  const headerClasses = variant === 'masters'
    ? 'bg-background border-b-4 border-primary shadow-sm'
    : 'bg-background border-b border-border';

  return (
    <div className={`${headerClasses} ${className}`} {...props}>
      <Container>
        <div className="py-6 lg:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className={`text-3xl font-bold mb-2 ${
                variant === 'masters'
                  ? 'font-serif text-primary'
                  : 'text-foreground'
              }`}>
                {title}
              </h1>
              {description && (
                <p className={`text-base leading-relaxed ${
                  variant === 'masters'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex flex-col sm:flex-row gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}