'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ChevronDown, ChevronUp, Grip, Eye, EyeOff, Settings } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SectionId =
  | 'metrics'
  | 'appointments'
  | 'clinicalProgress'
  | 'aiInsights'
  | 'quickActions';

interface DashboardSection {
  id: SectionId;
  title: string;
  visible: boolean;
  order: number;
  collapsed: boolean;
}

interface CustomizableLayoutProps {
  children: React.ReactNode;
  sectionId: SectionId;
  title: string;
  className?: string;
  defaultCollapsed?: boolean;
  allowHide?: boolean;
  allowCollapse?: boolean;
  allowReorder?: boolean;
}

export const CustomizableSection: React.FC<CustomizableLayoutProps> = ({
  children,
  sectionId,
  title,
  className,
  defaultCollapsed = false,
  allowHide = true,
  allowCollapse = true,
  allowReorder = true,
}) => {
  const {
    sections,
    updateSectionVisibility,
    updateSectionCollapsed
  } = useDashboardStore();

  // Find the section in the store
  const section = sections.find((s) => s.id === sectionId);

  // If section doesn't exist in store, use default values
  const isVisible = section ? section.visible : true;
  const isCollapsed = section ? section.collapsed : defaultCollapsed;

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
      className={cn(
        "rounded-xl border border-gray-100/80 bg-gradient-to-b from-white to-gray-50/30",
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
        "backdrop-blur-[2px] backdrop-saturate-[1.8]",
        "transition-all duration-500 ease-in-out",
        "hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-gray-200/80",
        "overflow-hidden",
        className
      )}
      whileHover={{ y: -2 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          {allowReorder && (
            <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors duration-300">
              <Grip size={16} />
            </span>
          )}
          <h3 className="font-medium text-gray-800 tracking-tight">{title}</h3>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            {allowCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateSectionCollapsed(sectionId, !isCollapsed)}
                    aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                  >
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCollapsed ? "Expand section" : "Collapse section"}
                </TooltipContent>
              </Tooltip>
            )}

            {allowHide && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label="Section settings"
                      >
                        <Settings size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Section settings</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => updateSectionVisibility(sectionId, false)}>
                    <EyeOff className="mr-2 h-4 w-4" />
                    <span>Hide section</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TooltipProvider>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: { 
                height: { type: "spring", stiffness: 100, damping: 20, duration: 0.4 },
                opacity: { duration: 0.5, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: { 
                height: { duration: 0.3 },
                opacity: { duration: 0.2 }
              }
            }}
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface CustomizableLayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const CustomizableLayoutContainer: React.FC<CustomizableLayoutContainerProps> = ({
  children,
  className,
}) => {
  const { sections, updateSectionOrder, resetLayout, updateSectionVisibility } = useDashboardStore();
  const [orderedSections, setOrderedSections] = useState<DashboardSection[]>([]);

  // Update local state when sections change in the store
  useEffect(() => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    setOrderedSections(sortedSections);
  }, [sections]);

  // Handle reordering
  const handleReorder = (newOrder: DashboardSection[]) => {
    setOrderedSections(newOrder);

    // Update the order in the store
    newOrder.forEach((section, index) => {
      updateSectionOrder(section.id, index);
    });
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona tu espacio de trabajo clínico</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-300 flex items-center gap-2 shadow-sm"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Personalizar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={resetLayout}>
              Reset Layout
            </DropdownMenuItem>
            {sections
              .filter((section) => !section.visible)
              .map((section) => (
                <DropdownMenuItem
                  key={section.id}
                  onClick={() => updateSectionVisibility(section.id, true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Show {section.title}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Reorder.Group
        axis="y"
        values={orderedSections}
        onReorder={handleReorder}
        className="space-y-8"
      >
        {orderedSections
          .filter((section) => section.visible)
          .map((section) => (
            <Reorder.Item
              key={section.id}
              value={section}
              className="cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 20, 
                duration: 0.4 
              }}
            >
              {/* This is where you would render your CustomizableSection components */}
              {/* We'll just pass the children directly */}
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.props.sectionId === section.id) {
                  return child;
                }
                return null;
              })}
            </Reorder.Item>
          ))}
      </Reorder.Group>
    </div>
  );
};