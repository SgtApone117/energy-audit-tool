'use client';

import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        <button type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionStyles[position]}`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-normal">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ content, position = 'right' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <span className="text-gray-400 hover:text-gray-600 cursor-help ml-1">
        <HelpCircle className="w-4 h-4 inline" />
      </span>
    </Tooltip>
  );
}
