'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import AuthMessage from '@/components/auth/AuthMessage';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Ha ocurrido un error de autenticación';

  return (
    <AuthPageLayout>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Error de Autenticación</h1>

        <div className="mt-4">
          <AuthMessage type="error" message={message} />
        </div>

        <div className="mt-6">
          <Button asChild>
            <Link href="/auth/login">
              Volver a Iniciar Sesión
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Si continúas experimentando problemas, por favor contacta a soporte.
        </p>
      </div>
    </AuthPageLayout>
  );
}
