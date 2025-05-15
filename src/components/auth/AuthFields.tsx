'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react';

// Base props that all field components share
interface BaseFieldProps {
  id?: string;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

/**
 * Email input field with consistent styling and an email icon
 */
export function EmailField({
  id,
  name = 'email',
  label = 'Email',
  required = true,
  disabled = false,
  placeholder = 'tu@email.com',
  className = '',
  defaultValue = '',
}: BaseFieldProps) {
  const fieldId = id || name;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id={fieldId}
          name={name}
          type="email"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`pl-10 ${className}`}
        />
      </div>
    </div>
  );
}

/**
 * Password input field with consistent styling, a lock icon, and visibility toggle
 */
export function PasswordField({
  id,
  name = 'password',
  label = 'Contraseña',
  required = true,
  disabled = false,
  placeholder = '••••••••',
  className = '',
}: BaseFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = id || name;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id={fieldId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Full name input field with consistent styling and a user icon
 */
export function FullNameField({
  id,
  name = 'fullName',
  label = 'Nombre Completo',
  required = true,
  disabled = false,
  placeholder = 'Juan Pérez',
  className = '',
  defaultValue = '',
}: BaseFieldProps) {
  const fieldId = id || name;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id={fieldId}
          name={name}
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`pl-10 ${className}`}
        />
      </div>
    </div>
  );
}
