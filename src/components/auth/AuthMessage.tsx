'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AuthMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

/**
 * Standardized component for displaying auth-related messages
 * 
 * @param type - The type of message (success, error, info)
 * @param message - The message text to display
 */
export default function AuthMessage({ type, message }: AuthMessageProps) {
  if (!message) return null;
  
  const baseClasses = "rounded-md p-4 text-sm";
  let typeClasses = "";
  let IconComponent = Info;

  if (type === 'success') {
    typeClasses = "bg-green-50 text-green-700";
    IconComponent = CheckCircle;
  } else if (type === 'error') {
    typeClasses = "bg-red-50 text-red-700";
    IconComponent = AlertCircle;
  } else { // info
    typeClasses = "bg-blue-50 text-blue-700";
  }

  return (
    <div className={`${baseClasses} ${typeClasses} flex items-start`}>
      <IconComponent className="h-5 w-5 mr-2 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
