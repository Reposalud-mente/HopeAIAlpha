'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertCircle, Clock, Database, User, Calendar, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCall {
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

interface ToolCallingVisualizerProps {
  toolCalls: ToolCall[];
  isLoading?: boolean;
}

export function ToolCallingVisualizer({ toolCalls, isLoading = false }: ToolCallingVisualizerProps) {
  const [expandedTools, setExpandedTools] = useState<string[]>([]);
  
  // Auto-expand the most recent tool call
  useEffect(() => {
    if (toolCalls.length > 0) {
      const latestToolId = `tool-${toolCalls.length - 1}`;
      setExpandedTools([latestToolId]);
    }
  }, [toolCalls.length]);

  if (isLoading) {
    return <ToolCallingSkeletonLoader />;
  }

  if (toolCalls.length === 0) {
    return null;
  }

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'search_patients':
        return <Search className="h-4 w-4" />;
      case 'get_patient_details':
        return <User className="h-4 w-4" />;
      case 'schedule_appointment':
        return <Calendar className="h-4 w-4" />;
      case 'query_database':
        return <Database className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return 'In progress...';
    const durationMs = endTime.getTime() - startTime.getTime();
    return `${durationMs}ms`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tool Execution</CardTitle>
        <CardDescription>
          AI assistant is using tools to help answer your question
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <Accordion
            type="multiple"
            value={expandedTools}
            onValueChange={setExpandedTools}
            className="space-y-2"
          >
            {toolCalls.map((tool, index) => (
              <AccordionItem
                key={`tool-${index}`}
                value={`tool-${index}`}
                className="border rounded-md overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getToolIcon(tool.name)}
                      <span className="font-medium">{tool.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(tool.status))}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(tool.status)}
                          {tool.status}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(tool.startTime, tool.endTime)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2">
                    <Tabs defaultValue="args">
                      <TabsList className="mb-2">
                        <TabsTrigger value="args">Arguments</TabsTrigger>
                        <TabsTrigger value="result">Result</TabsTrigger>
                      </TabsList>
                      <TabsContent value="args">
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                          {JSON.stringify(tool.args, null, 2)}
                        </pre>
                      </TabsContent>
                      <TabsContent value="result">
                        {tool.status === 'error' ? (
                          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                            <p className="text-red-600 dark:text-red-400 font-medium">Error:</p>
                            <p>{tool.error || 'Unknown error occurred'}</p>
                          </div>
                        ) : (
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                            {tool.result ? JSON.stringify(tool.result, null, 2) : 'Waiting for result...'}
                          </pre>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ToolCallingSkeletonLoader() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-md p-4">
              <div className="flex items-center justify-between w-full">
                <Skeleton className="h-5 w-[120px]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
