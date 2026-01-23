'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-screen pb-4' : 'max-h-0'
        }`}
      >
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {children}
    </div>
  );
}
