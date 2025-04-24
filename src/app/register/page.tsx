'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const { register } = useAuth();
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
  const router = useRouter();
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
      // Register the user using the auth context
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        licenseNumber: formData.licenseNumber || undefined,
        specialty: formData.specialty || undefined,
      });

      if (!success) {
        throw new Error('Error al registrar usuario');
      }

      // Show success message
      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada. Iniciando sesión...',
      });

      // Automatically sign in the user
      await signIn('credentials', {
        redirect: true,
        callbackUrl: '/dashboard',
        email: formData.email,
        password: formData.password,
      });

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
    <div className="min-h-screen flex items-center justify-center bg-calm-bg p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-4">
            HA
          </div>
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para acceder a HopeAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Número de licencia profesional</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Iniciar sesión
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link href="#" className="underline hover:text-blue-500">
              Términos
            </Link>{' '}
            y{' '}
            <Link href="#" className="underline hover:text-blue-500">
              Política de Privacidad
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
