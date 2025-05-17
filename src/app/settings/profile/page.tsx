"use client"

import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil de Usuario</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información de perfil y preferencias.
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Tu información básica de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground">{user?.email || 'No disponible'}</p>
              </div>
              <div>
                <h3 className="font-medium">Nombre</h3>
                <p className="text-sm text-muted-foreground">{user?.user_metadata?.full_name || 'No disponible'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
