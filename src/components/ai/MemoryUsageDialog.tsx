/**
 * Memory Usage Dialog Component
 * Shows which memories are being used in the current conversation
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Brain } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-formatter';
import { Badge } from '@/components/ui/badge';

interface MemoryUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memories: any[];
  onDeleteMemory?: (memoryId: string) => void;
}

export function MemoryUsageDialog({
  open,
  onOpenChange,
  memories,
  onDeleteMemory,
}: MemoryUsageDialogProps) {
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);

  const handleDeleteMemory = async (memoryId: string) => {
    if (!onDeleteMemory) return;

    setDeletingMemoryId(memoryId);
    try {
      await onDeleteMemory(memoryId);
    } finally {
      setDeletingMemoryId(null);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memorias utilizadas
          </DialogTitle>
          <DialogDescription>
            Estas son las memorias que el asistente está utilizando para responder a tu consulta.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] mt-4">
          {memories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay memorias siendo utilizadas
            </div>
          ) : (
            <div className="space-y-4">
              {memories.map((memory) => (
                <div key={memory.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="text-sm">{memory.memory}</div>
                    {onDeleteMemory && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={() => handleDeleteMemory(memory.id)}
                        disabled={deletingMemoryId === memory.id}
                      >
                        <Trash2 className={`h-3 w-3 ${deletingMemoryId === memory.id ? 'animate-pulse' : ''}`} />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <Badge variant="outline" className="text-xs">
                      {formatDate(memory.created_at)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MemoryUsageDialog;
