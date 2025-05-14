'use client';

import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface DemoModeBannerProps {
  className?: string;
}

/**
 * Demo Mode Banner Component
 * 
 * This component displays a banner indicating that the application is in demo mode.
 * It can be dismissed by the user.
 * 
 * @param className Optional CSS class name for styling
 */
export default function DemoModeBanner({ className = '' }: DemoModeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700">
            <strong>Modo Demo:</strong> Esta es una versión de demostración con datos de ejemplo.
            Las funcionalidades están limitadas y los datos no son reales.
          </p>
        </div>
        <button
          type="button"
          className="ml-auto flex-shrink-0 text-blue-500 hover:text-blue-700 focus:outline-none"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
