/**
 * Memory Indicator Component
 * Shows when memory is being used in the current conversation
 */

import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { MemoryUsageDialog } from './MemoryUsageDialog';

interface MemoryIndicatorProps {
  isUsingMemory: boolean;
  memoryCount: number;
  memories: any[];
  onClick?: () => void;
}

export function MemoryIndicator({ isUsingMemory, memoryCount, memories, onClick }: MemoryIndicatorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!isUsingMemory || memoryCount === 0) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
            onClick={handleClick}
          >
            <Brain className="h-3 w-3" />
            <Badge variant="outline" className="px-1 py-0 h-4">
              {memoryCount}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Usando {memoryCount} {memoryCount === 1 ? 'memoria' : 'memorias'} para esta respuesta</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <MemoryUsageDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      memories={memories}
    />
  );
}

export default MemoryIndicator;
