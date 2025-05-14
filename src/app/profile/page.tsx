'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/app/auth/actions';
import { useTransition } from 'react';

export default function ProfilePage() {
  return <ProfileContent />;
}

function ProfileContent() {
  const { user, loading: isLoading } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 font-montserrat-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Format user role for display
  const formatRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'PSYCHOLOGIST':
        return 'Psicólogo';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-tertiary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-montserrat-bold mb-8 text-gray-900">Mi Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="md:col-span-2 shadow-md border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-montserrat-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Detalles de tu cuenta en HopeAI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.picture && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-montserrat-medium text-gray-500">Nombre</h3>
                  <p className="text-lg font-montserrat-medium">{user?.name || 'No disponible'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-montserrat-medium text-gray-500">Correo Electrónico</h3>
                  <p className="text-lg font-montserrat-medium">{user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-montserrat-medium text-gray-500">Rol</h3>
                  <p className="text-lg font-montserrat-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    {user?.role ? formatRole(user.role) : 'Psicólogo'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-montserrat-medium text-gray-500">ID de Usuario</h3>
                  <p className="text-lg font-montserrat-medium text-gray-700 truncate">{user?.sub || user?.id || 'No disponible'}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Volver al Dashboard
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
                disabled={isPending}
              >
                <LogOut className="h-4 w-4" />
                {isPending ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
              </Button>
            </CardFooter>
          </Card>

          {/* Account Actions Card */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-montserrat-bold">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/patients">
                  Mis Pacientes
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/reports">
                  Mis Informes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
