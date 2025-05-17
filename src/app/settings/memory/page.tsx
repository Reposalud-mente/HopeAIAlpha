"use client"

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { toast } from '@/components/ui/use-toast';
import { Brain, Trash2 } from 'lucide-react';
import MemoryManager from '@/components/ai/MemoryManager';
import { AIAssistantProvider, useAIAssistant } from '@/contexts/ai-assistant-context';

export default function MemorySettingsPage() {
  return (
    <AIAssistantProvider>
      <MemorySettings />
    </AIAssistantProvider>
  );
}

function MemorySettings() {
  const { user } = useAuth();
  const {
    memoryEnabled,
    toggleMemory,
    memoryLimit,
    setMemoryLimitValue,
    refreshMemories
  } = useAIAssistant();
  const [isDeleting, setIsDeleting] = useState(false);

  const userId = user?.id || user?.email || '';

  const handleDeleteAllMemories = async () => {
    if (!userId) return;

    try {
      setIsDeleting(true);
      const mem0Service = getMem0Service();
      const result = await mem0Service.deleteAllMemories(userId);

      if (result.success === false) {
        throw new Error('Failed to delete all memories');
      }

      toast({
        title: "Memorias eliminadas",
        description: "Todas las memorias han sido eliminadas correctamente.",
        duration: 3000,
      });

      // Refresh memories after deletion
      refreshMemories();
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

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Memoria</h1>
          <p className="text-muted-foreground mt-2">
            Administra cómo el asistente de IA recuerda tus conversaciones anteriores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Memoria Persistente</CardTitle>
            <CardDescription>
              Controla si el asistente de IA debe recordar conversaciones anteriores para proporcionar respuestas más contextualizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="memory-enabled"
                checked={memoryEnabled}
                onCheckedChange={toggleMemory}
              />
              <Label htmlFor="memory-enabled">Habilitar memoria persistente</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Cuando está habilitada, el asistente puede recordar información de conversaciones anteriores para proporcionar respuestas más personalizadas y contextuales.
            </p>

            <div className="mt-6">
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
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteAllMemories}
              disabled={isDeleting || !memoryEnabled}
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
              Visualiza y administra las memorias que el asistente ha guardado de tus conversaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemoryManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
