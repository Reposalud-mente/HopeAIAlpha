'use client';

import { useState, useEffect, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExtendedAuth } from '@/contexts/extended-auth-context';
import { Input } from '@/components/ui/input';

// Component that uses searchParams - wrapped in Suspense
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithAuth0, error: authError } = useExtendedAuth();

  // Check for error parameters in the URL
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Display error toast if there's an error in the URL
  useEffect(() => {
    if (errorParam) {
      setIsLoading(false);
      toast({
        title: 'Error de autenticación',
        description: errorDescription || 'Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  }, [errorParam, errorDescription, toast]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!email || !password) {
      setFormError('Por favor, ingresa tu correo electrónico y contraseña');
      return;
    }
    
    setIsLoading(true);

    try {
      // Show loading toast
      toast({
        title: 'Iniciando sesión...',
        description: 'Verificando credenciales',
        variant: 'default',
      });

      // Get the Auth0 login URL with credentials
      const domain = 'https://hopeai.us.auth0.com';
      const clientId = '6QHlKSDpNbbXK0dOkufSe5zWC3xnus6y';
      const redirectUri = `${window.location.origin}/api/auth/callback`;
      const state = JSON.stringify({ returnTo: '/dashboard' });

      // Redirect to Auth0 login page with credentials
      // Note: Auth0 will handle the actual authentication with these credentials
      const loginUrl = `${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=openid%20profile%20email&state=${encodeURIComponent(state)}&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

      window.location.href = loginUrl;
    } catch (err) {
      console.error('Login redirect error:', err);
      setIsLoading(false);

      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de inicio de sesión',
        variant: 'destructive',
      });
    }
  };

  // Handle Auth0 login (legacy button - can be removed if not needed)
  const handleAuth0Login = async () => {
    setIsLoading(true);

    try {
      // Show loading toast
      toast({
        title: 'Redirigiendo...',
        description: 'Preparando inicio de sesión seguro',
        variant: 'default',
      });

      // Get the Auth0 login URL
      const domain = 'https://hopeai.us.auth0.com';
      const clientId = '6QHlKSDpNbbXK0dOkufSe5zWC3xnus6y';
      const redirectUri = `${window.location.origin}/api/auth/callback`;
      const state = JSON.stringify({ returnTo: '/dashboard' });

      // Redirect to Auth0 login page
      const loginUrl = `${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=openid%20profile%20email&state=${encodeURIComponent(state)}`;

      window.location.href = loginUrl;
    } catch (err) {
      console.error('Login redirect error:', err);
      setIsLoading(false);

      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de inicio de sesión',
        variant: 'destructive',
      });
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);

    try {
      // Call the demo login API endpoint
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error accessing demo account');
      }

      const data = await response.json();

      // Success toast
      toast({
        title: 'Modo Demo',
        description: 'Accediendo con cuenta de demostración...',
        variant: 'default',
      });

      // Redirect to Auth0 login URL with demo credentials
      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      } else {
        throw new Error('No login URL returned');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      console.error('Error al acceder a la cuenta de demostración');
      toast({
        title: 'Error',
        description: 'No se pudo acceder a la cuenta de demostración',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tertiary p-4 animate-fadeIn overflow-auto">
      <div className="absolute top-4 left-4 md:top-[3vh] md:left-[3vh]">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <span className="text-xl md:text-2xl font-montserrat-bold tracking-wider">HopeAI</span>
        </Link>
      </div>

      <Card className="w-full max-w-[95%] md:max-w-[450px] shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl my-16">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/90 to-secondary"></div>
        <CardHeader className="space-y-4 text-center pt-4">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary rounded-xl flex items-center justify-center text-white text-xl font-bold mb-2 shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-montserrat-bold tracking-wider">HA</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-montserrat-bold tracking-wider text-gray-900 letter-spacing-wide">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600 font-montserrat-regular text-base md:text-lg">
            Accede a tu cuenta para gestionar pacientes y generar informes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {formError}
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-montserrat-medium tracking-wide transition-all duration-300 btn-hover-effect h-12 text-base md:text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-montserrat-medium tracking-wider text-sm">O</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-montserrat-medium tracking-wide transition-all duration-300 py-3 h-12 text-base md:text-lg"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Accediendo...
              </span>
            ) : (
              'Probar Demo'
            )}
          </Button>

          <div className="flex items-center justify-center space-x-2 text-sm md:text-base text-black">
            <Shield className="h-5 w-5 text-black" />
            <span className="font-montserrat-medium">Conexión segura y encriptada</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pb-6 pt-2">
          <div className="text-center text-sm md:text-base text-gray-700">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-montserrat-medium text-primary hover:text-primary/80 transition-colors">
              Regístrate
            </Link>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-600">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="#" className="font-montserrat-medium underline hover:text-primary/80 transition-colors">
              Términos
            </Link>{' '}
            y{' '}
            <Link href="#" className="font-montserrat-medium underline hover:text-primary/80 transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-tertiary p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 font-montserrat-medium">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}