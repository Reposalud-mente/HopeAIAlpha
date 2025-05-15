'use client';

import { login } from '../actions';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import AuthForm from '@/components/auth/AuthForm';
import { EmailField, PasswordField } from '@/components/auth/AuthFields';
import AuthMessage from '@/components/auth/AuthMessage';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const returnTo = searchParams.get('returnTo');

  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (formData: FormData) => {
    // Add returnTo to formData if it exists
    if (returnTo) {
      formData.append('returnTo', returnTo);
    }

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setErrorMessage(result.error);
      }
      // Successful login is handled by redirect in the server action
    });
  };

  return (
    <AuthPageLayout>
      {message && <AuthMessage type="info" message={message} />}

      <AuthForm
        title="Iniciar Sesión"
        description="Ingresa tus credenciales para acceder a tu cuenta"
        onSubmitAction={handleLogin}
        submitButtonText="Iniciar Sesión"
        errorMessage={errorMessage}
        isPending={isPending}
        footer={
          <p>
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
              Regístrate
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
      </AuthForm>
    </AuthPageLayout>
  );
}
