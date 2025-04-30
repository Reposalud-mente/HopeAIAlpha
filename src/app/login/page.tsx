'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: true,
        callbackUrl: '/dashboard',
        email,
        password,
      });

      // With redirect: true, we won't reach this code on successful login
      // This will only execute if there's an error and redirect doesn't happen
      if (result?.error) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
        toast({
          title: 'Error al iniciar sesión',
          description: 'Credenciales inválidas. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
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

  const handleDemoLogin = () => {
    setEmail('psicologo@hopeai.com');
    setPassword('password123');
    // Set a small timeout to allow the demo credentials to be displayed before submitting
    setTimeout(() => {
      // Using the manual form submission to trigger the handleSubmit function
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }, 500);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-tertiary p-[2vh] animate-fadeIn overflow-hidden">
      <div className="absolute top-[2vh] left-[2vh] md:top-[3vh] md:left-[3vh]">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <span className="text-xl md:text-2xl font-montserrat-bold tracking-wider">HopeAI</span>
        </Link>
      </div>

      <Card className="w-full max-w-[90vw] md:max-w-[450px] shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl max-h-[96vh] overflow-y-auto">
        <div className="h-[0.4vh] w-full bg-gradient-to-r from-primary via-primary/90 to-secondary"></div>
        <CardHeader className="space-y-[1.5vh] text-center pt-[2vh]">
          <div className="mx-auto w-[4.5vh] h-[4.5vh] bg-primary rounded-xl flex items-center justify-center text-white text-xl font-bold mb-[0.5vh] shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-montserrat-bold tracking-wider">HA</span>
          </div>
          <CardTitle className="text-[2.5vh] font-montserrat-bold tracking-wider text-gray-900 letter-spacing-wide">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600 font-montserrat-regular text-[1.6vh]">
            Accede a tu cuenta para gestionar pacientes y generar informes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-[1.5vh]">
          <form onSubmit={handleSubmit} className="space-y-[1.8vh]">
            <div className="space-y-[0.6vh]">
              <label htmlFor="email" className="text-[1.5vh] font-montserrat-medium text-gray-700 flex items-center">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-[5vh] min-h-[40px] text-[1.8vh]"
              />
            </div>
            <div className="space-y-[0.6vh]">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[1.5vh] font-montserrat-medium text-gray-700">
                  Contraseña
                </label>
                <Link href="#" className="text-[1.5vh] font-montserrat-medium text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-[5vh] min-h-[40px] text-[1.8vh]"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox id="remember" className="text-primary border-gray-300" />
              <label
                htmlFor="remember"
                className="text-[1.5vh] font-montserrat-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                Recordar mis datos
              </label>
            </div>

            {error && <p className="text-red-500 text-[1.5vh] mt-[0.5vh] font-montserrat-medium">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-[1vh] font-montserrat-medium tracking-wide transition-all duration-300 btn-hover-effect h-[5vh] min-h-[40px] text-[1.8vh]"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-[2vh] relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-[1vh] text-gray-500 font-montserrat-medium tracking-wider text-[1.5vh]">O</span>
            </div>
          </div>

          <div className="mt-[2vh]">
            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-montserrat-medium tracking-wide transition-all duration-300 py-[1vh] h-[5vh] min-h-[40px] text-[1.8vh]"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Probar Demo
            </Button>
          </div>

          <div className="mt-[2vh] flex items-center justify-center space-x-[0.5vh] text-[1.5vh] text-black">
            <Shield className="h-[2vh] w-[2vh] min-h-[16px] min-w-[16px] text-black" />
            <span className="font-montserrat-medium">Conexión segura y encriptada</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-[1vh] pb-[2vh] pt-[1vh]">
          <div className="text-center text-[1.5vh] text-gray-700">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-montserrat-medium text-primary hover:text-primary/80 transition-colors">
              Regístrate
            </Link>
          </div>
          <div className="text-center text-[1.3vh] min-h-[10px] text-gray-600">
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