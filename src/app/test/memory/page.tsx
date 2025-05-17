"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useAIAssistant } from '@/contexts/ai-assistant-context';
import { AIAssistantProvider } from '@/contexts/ai-assistant-context';
import { Brain, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { useAuth } from '@/hooks/useAuth';

function MemoryTest() {
  const { 
    memoryEnabled, 
    toggleMemory, 
    memoryLimit, 
    setMemoryLimitValue,
    memories,
    refreshMemories,
    isLoadingMemories
  } = useAIAssistant();
  
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const userId = user?.id || user?.email || '';
  
  const handleDeleteAllMemories = async () => {
    if (!userId) return;
    
    try {
      setIsDeleting(true);
      const mem0Service = getMem0Service();
      
      // Check if memory service is available
      const isMemoryAvailable = await mem0Service.isAvailable();
      
      if (!isMemoryAvailable) {
        throw new Error('Memory service is not available');
      }
      
      const result = await mem0Service.deleteAllMemories(userId);
      
      if (result.success === false) {
        throw new Error('Failed to delete all memories');
      }
      
      // Refresh memories after deletion
      await refreshMemories();
      
      toast({
        title: "Memorias eliminadas",
        description: "Todas las memorias han sido eliminadas correctamente.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting all memories:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar todas las memorias. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Load memories when the component mounts
  useEffect(() => {
    if (userId) {
      refreshMemories();
    }
  }, [userId, refreshMemories]);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Prueba de Integración de Memoria</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Memoria</CardTitle>
            <CardDescription>
              Controla cómo el asistente utiliza la memoria para proporcionar respuestas contextualizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="memory-enabled"
                  checked={memoryEnabled}
                  onCheckedChange={toggleMemory}
                />
                <Label htmlFor="memory-enabled">Habilitar memoria persistente</Label>
              </div>
              
              <div>
                <Label htmlFor="memory-limit" className="mb-2 block">
                  Límite de memorias: {memoryLimit}
                </Label>
                <Slider
                  id="memory-limit"
                  min={1}
                  max={10}
                  step={1}
                  value={[memoryLimit]}
                  onValueChange={(value) => setMemoryLimitValue(value[0])}
                  disabled={!memoryEnabled}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Controla cuántas memorias relevantes puede utilizar el asistente en cada respuesta.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAllMemories}
              disabled={isDeleting || !memoryEnabled || memories.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Eliminando..." : "Eliminar todas las memorias"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Memorias Almacenadas</CardTitle>
            <CardDescription>
              {isLoadingMemories 
                ? "Cargando memorias..." 
                : `${memories.length} memorias encontradas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {memories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No hay memorias almacenadas
                </div>
              ) : (
                memories.map((memory) => (
                  <div key={memory.id} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <div className="text-sm">{memory.memory}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(memory.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={refreshMemories}
              disabled={isLoadingMemories}
            >
              Actualizar
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instrucciones de Prueba</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Asegúrate de que la memoria esté habilitada.</li>
          <li>Abre el asistente de IA y haz algunas preguntas para generar memorias.</li>
          <li>Pregunta algo relacionado con tus conversaciones anteriores.</li>
          <li>Observa cómo el asistente utiliza las memorias para proporcionar respuestas contextualizadas.</li>
          <li>Prueba a cambiar el límite de memorias y observa cómo afecta a las respuestas.</li>
        </ol>
      </div>
    </div>
  );
}

export default function MemoryTestPage() {
  return (
    <AIAssistantProvider>
      <MemoryTest />
    </AIAssistantProvider>
  );
}
