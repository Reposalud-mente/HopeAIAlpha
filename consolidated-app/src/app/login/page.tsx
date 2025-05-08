'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

// Component that uses searchParams - wrapped in Suspense
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for error or success messages from URL parameters
  useEffect(() => {
    const errorMessage = searchParams.get('error');
    const successMessage = searchParams.get('success');

    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      toast({
        title: 'Error al iniciar sesión',
        description: decodeURIComponent(errorMessage),
        variant: 'destructive',
      });
    }

    if (successMessage) {
      toast({
        title: 'Éxito',
        description: decodeURIComponent(successMessage),
        variant: 'default',
      });
    }
  }, [searchParams, toast]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid && email) {
      setEmailError('Por favor, ingresa un correo electrónico válido');
    } else {
      setEmailError('');
    }

    return isValid || !email;
  };

  // Validate password (not empty)
  const validatePassword = (password: string): boolean => {
    const isValid = password.length > 0;

    if (!isValid && password) {
      setPasswordError('La contraseña es requerida');
    } else {
      setPasswordError('');
    }

    return isValid || !password;
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false, // Changed to false to handle errors better
        email,
        password,
        remember: rememberMe, // Pass the remember me state
      });

      if (result?.error) {
        // More specific error messages based on error type
        if (result.error === 'CredentialsSignin') {
          setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
        } else {
          setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
        }

        toast({
          title: 'Error al iniciar sesión',
          description: result.error === 'CredentialsSignin'
            ? 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
            : 'Error al iniciar sesión. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      } else {
        // Success toast before redirect
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Redirigiendo al dashboard...',
          variant: 'default',
        });

        // Redirect manually after showing the toast
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
      toast({
        title: 'Error al iniciar sesión',
        description: 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);

    try {
      // Call the demo login API endpoint instead of exposing credentials
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error accessing demo account');
      }

      // Success toast
      toast({
        title: 'Modo Demo',
        description: 'Accediendo con cuenta de demostración...',
        variant: 'default',
      });

      // Redirect to dashboard after demo login
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Error al acceder a la cuenta de demostración');
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
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm md:text-base font-montserrat-medium text-gray-700 flex flex-wrap items-center">
                Correo electrónico
                {emailError && (
                  <span className="ml-2 text-red-500 flex items-center text-xs md:text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </span>
                )}
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12 text-base ${
                  emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm md:text-base font-montserrat-medium text-gray-700 flex items-center">
                  Contraseña
                  {passwordError && (
                    <span className="ml-2 text-red-500 flex items-center text-xs md:text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </span>
                  )}
                </label>
                <Link href="/reset-password" className="text-sm md:text-base font-montserrat-medium text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                className={`w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12 text-base ${
                  passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                className="text-primary border-gray-300 h-5 w-5"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm md:text-base font-montserrat-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                Recordar mis datos
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-500 text-sm font-montserrat-medium">{error}</p>
              </div>
            )}

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
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-montserrat-medium tracking-wider text-sm">O</span>
            </div>
          </div>

          <div className="mt-6">
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
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2 text-sm md:text-base text-black">
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