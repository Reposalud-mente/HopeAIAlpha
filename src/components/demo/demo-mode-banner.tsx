'use client';

/**
 * Demo Mode Banner Component
 * 
 * This component displays a banner when a user is in demo mode,
 * prompting them to populate demo data if needed.
 */

import { useState } from 'react';
import { useDemoMode } from '@/hooks/use-demo-mode';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DemoModeBannerProps {
  className?: string;
}

export function DemoModeBanner({ className = '' }: DemoModeBannerProps) {
  const { isLoading, needsDemoData, populateDemoData, error } = useDemoMode();
  const [isPopulating, setIsPopulating] = useState(false);
  const router = useRouter();

  // Handle populating demo data
  const handlePopulateDemoData = async () => {
    setIsPopulating(true);
    await populateDemoData();
    setIsPopulating(false);
    
    // Refresh the page to show the new data
    router.refresh();
  };

  // If not loading and doesn't need demo data, don't show the banner
  if (!isLoading && !needsDemoData && !error) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : needsDemoData ? (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Modo Alpha Testing</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">
              Bienvenido a HopeAI Alpha. Para comenzar a explorar la plataforma, puedes crear pacientes de demostración automáticamente.
            </p>
            <Button
              variant="outline"
              className="mt-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
              onClick={handlePopulateDemoData}
              disabled={isPopulating}
            >
              {isPopulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando datos de demostración...
                </>
              ) : (
                'Crear pacientes de demostración'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertTitle className="text-blue-800">Verificando datos</AlertTitle>
          <AlertDescription className="text-blue-700">
            Comprobando si se necesitan datos de demostración...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
