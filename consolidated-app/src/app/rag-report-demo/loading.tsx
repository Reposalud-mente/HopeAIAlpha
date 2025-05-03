import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium">Cargando Generador de Informes...</h2>
      <p className="text-gray-500 mt-2">Preparando la interfaz de generación de informes con RAG.</p>
    </div>
  );
}
