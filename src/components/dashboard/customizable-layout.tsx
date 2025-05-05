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
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden",
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {allowReorder && (
            <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <Grip size={16} />
            </span>
          )}
          <h3 className="font-medium text-gray-800">{title}</h3>
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">{children}</div>
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
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Customize Dashboard
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
        className="space-y-6"
      >
        {orderedSections
          .filter((section) => section.visible)
          .map((section) => (
            <Reorder.Item
              key={section.id}
              value={section}
              className="cursor-grab active:cursor-grabbing"
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