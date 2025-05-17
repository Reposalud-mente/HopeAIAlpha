"use client"

import { useState } from 'react';
import { useAIAssistant } from '@/contexts/ai-assistant-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw } from 'lucide-react';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

export function MemoryManager() {
  const { memories, isLoadingMemories, refreshMemories } = useAIAssistant();
  const { user } = useAuth();
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const userId = user?.id || user?.email || '';

  const handleDeleteMemory = async (memoryId: string) => {
    if (!userId) return;

    try {
      setDeletingMemoryId(memoryId);
      const mem0Service = getMem0Service();
      const result = await mem0Service.deleteMemory(memoryId, userId);

      if (result.success === false) {
        throw new Error('Failed to delete memory');
      }

      // Refresh memories after deletion
      await refreshMemories();

      toast({
        title: "Memoria eliminada",
        description: "La memoria ha sido eliminada correctamente.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la memoria. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeletingMemoryId(null);
    }
  };

  const handleDeleteAllMemories = async () => {
    if (!userId) return;

    try {
      setIsDeletingAll(true);
      const mem0Service = getMem0Service();
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
      setIsDeletingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
        <CardTitle className="text-lg">Memorias del Asistente</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshMemories}
            disabled={isLoadingMemories}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingMemories ? 'animate-spin' : ''}`} />
          </Button>
          {memories.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllMemories}
              disabled={isDeletingAll || isLoadingMemories}
            >
              Eliminar todo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {isLoadingMemories ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : memories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay memorias almacenadas
            </div>
          ) : (
            <div className="divide-y">
              {memories.map((memory) => (
                <div key={memory.id} className="p-3 hover:bg-muted/50">
                  <div className="text-sm">{memory.memory}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(memory.created_at)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteMemory(memory.id)}
                      disabled={deletingMemoryId === memory.id}
                    >
                      <Trash2 className={`h-3 w-3 ${deletingMemoryId === memory.id ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default MemoryManager;
