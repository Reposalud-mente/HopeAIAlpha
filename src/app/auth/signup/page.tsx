'use client';

import { signUp } from '../actions';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import AuthForm from '@/components/auth/AuthForm';
import { EmailField, PasswordField, FullNameField } from '@/components/auth/AuthFields';

export default function SignUpPage() {
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSignUp = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setErrorMessage(result.error);
        setMessage('');
      } else if (result?.message) {
        setMessage(result.message);
        setErrorMessage('');
      }
    });
  };

  return (
    <AuthPageLayout>
      <AuthForm
        title="Crear Cuenta"
        description="Regístrate para comenzar a usar la plataforma"
        onSubmitAction={handleSignUp}
        submitButtonText="Registrarse"
        errorMessage={errorMessage}
        successMessage={message}
        isPending={isPending}
        footer={
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Iniciar Sesión
            </Link>
          </p>
        }
      >
        <EmailField
          name="email"
          label="Email"
          disabled={isPending}
        />
        <PasswordField
          name="password"
          label="Contraseña"
          disabled={isPending}
        />
        <FullNameField
          name="fullName"
          label="Nombre Completo"
          disabled={isPending}
        />
      </AuthForm>
    </AuthPageLayout>
  );
}
