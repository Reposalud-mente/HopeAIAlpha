'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useExtendedAuth } from '@/contexts/extended-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Shield, Users, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useExtendedAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    licenseNumber: '',
    specialty: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Reset error
    setError('');

    // Check required fields
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Por favor, completa todos los campos requeridos.');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return false;
    }

    // Check password length
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the registration API directly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          licenseNumber: formData.licenseNumber || undefined,
          specialty: formData.specialty || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      // Show success message
      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...',
      });

      // Redirect to login page
      router.push('/login');

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
      toast({
        title: 'Error de registro',
        description: err instanceof Error ? err.message : 'Error al registrar usuario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tertiary p-4 animate-fadeIn">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <span className="text-xl md:text-2xl font-montserrat-bold tracking-wider">HopeAI</span>
        </Link>
      </div>

      <Card className="w-full max-w-[95%] md:max-w-md shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl my-16">
        <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-secondary/90 to-primary"></div>
        <CardHeader className="space-y-4 text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-white text-xl font-bold mb-2 shadow-md transition-transform duration-300 hover:scale-105">
            <Users className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-montserrat-bold tracking-wider text-gray-900 letter-spacing-wide">Crear Cuenta</CardTitle>
          <CardDescription className="text-gray-600 font-montserrat-regular">
            Regístrate para acceder a todas las herramientas clínicas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-montserrat-medium text-gray-700">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-montserrat-medium text-gray-700">Apellido <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-montserrat-medium text-gray-700">Correo electrónico <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-montserrat-medium text-gray-700">Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
              />
              <p className="text-xs text-gray-500 mt-1 font-montserrat-regular">Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-montserrat-medium text-gray-700">Confirmar contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-sm font-montserrat-medium text-gray-700">Número de licencia profesional</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-montserrat-medium text-gray-700">Especialidad</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full form-input-clinical transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary/20 font-montserrat-regular h-12"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2 font-montserrat-medium">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 font-montserrat-medium tracking-wide transition-all duration-300 btn-hover-effect mt-2 h-12 text-base md:text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : 'Registrarse'}
            </Button>

            <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-black">
              <Shield className="h-5 w-5 text-black" />
              <span className="font-montserrat-medium">Tus datos están protegidos</span>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 pt-4">
          <div className="text-center text-sm text-gray-700">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-montserrat-medium text-primary hover:text-primary/80 transition-colors">
              Iniciar sesión
            </Link>
          </div>
          <div className="text-center text-xs text-gray-600">
            Al registrarte, aceptas nuestros{' '}
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
