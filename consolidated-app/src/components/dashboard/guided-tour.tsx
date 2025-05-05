'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'right' | 'bottom' | 'left';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard-metrics"]',
    title: 'Dashboard Metrics',
    content: 'Here you can see key metrics about your practice, including active patients and upcoming sessions.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-appointments"]',
    title: 'Upcoming Appointments',
    content: 'View and manage your upcoming appointments. Click on an appointment to see details or make changes.',
    placement: 'top',
  },
  {
    target: '[data-tour="dashboard-filters"]',
    title: 'Filters and Search',
    content: 'Use these tools to filter and search through your dashboard data. You can filter by date, status, and more.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dashboard-customize"]',
    title: 'Customize Your Dashboard',
    content: 'Click here to customize your dashboard layout. You can rearrange, hide, or show different sections.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-export"]',
    title: 'Export Data',
    content: 'Export your dashboard data in different formats like CSV or PDF for reporting and analysis.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard-ai"]',
    title: 'AI Assistance',
    content: 'Get AI-powered insights and recommendations to help with your clinical practice.',
    placement: 'right',
  },
];

interface GuidedTourProps {
  onComplete?: () => void;
  className?: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  onComplete,
  className,
}) => {
  const { isFirstTimeUser, hasCompletedTour, setHasCompletedTour } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Start the tour automatically for first-time users
  useEffect(() => {
    if (isFirstTimeUser && !hasCompletedTour) {
      // Delay the start of the tour to ensure all elements are rendered
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeUser, hasCompletedTour]);
  
  // Update target element and position when step changes or window resizes
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        
        // Calculate position based on element and placement
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        let top = 0;
        let left = 0;
        
        switch (step.placement) {
          case 'top':
            top = rect.top + scrollTop - 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + 10;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - 10;
            break;
        }
        
        setTooltipPosition({ top, left });
        
        // Highlight the target element
        element.style.position = 'relative';
        element.style.zIndex = '50';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove highlight from previous element
      if (targetElement) {
        targetElement.style.boxShadow = '';
        targetElement.style.zIndex = '';
      }
    };
  }, [isOpen, currentStep, targetElement]);
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle tour completion
  const handleComplete = () => {
    setIsOpen(false);
    setHasCompletedTour(true);
    
    // Remove highlight from the last element
    if (targetElement) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
    }
    
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handle tour skip
  const handleSkip = () => {
    setIsOpen(false);
    setHasCompletedTour(true);
    
    // Remove highlight from the current element
    if (targetElement) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
    }
  };
  
  // Open the tour manually
  const openTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("flex items-center gap-1", className)}
        onClick={openTour}
        aria-label="Start guided tour"
      >
        <HelpCircle size={16} />
        <span>Tour</span>
      </Button>
    );
  }
  
  const currentTourStep = tourSteps[currentStep];
  
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleSkip}
      />
      
      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 w-80 bg-white rounded-lg shadow-lg"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: `translate(-50%, ${currentTourStep.placement === 'top' ? '-100%' : currentTourStep.placement === 'bottom' ? '0' : '-50%'})`,
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">{currentTourStep.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleSkip}
                aria-label="Close tour"
              >
                <X size={16} />
              </Button>
            </div>
            
            <p className="text-gray-600 mb-4">{currentTourStep.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: tourSteps.length }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      index === currentStep ? "bg-blue-500" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Skip
                </Button>
                
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </Button>
                )}
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStep < tourSteps.length - 1 && <ChevronRight size={16} />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-4 h-4 bg-white transform rotate-45",
              currentTourStep.placement === 'top' && "bottom-0 left-1/2 -mb-2 -ml-2",
              currentTourStep.placement === 'right' && "left-0 top-1/2 -ml-2 -mt-2",
              currentTourStep.placement === 'bottom' && "top-0 left-1/2 -mt-2 -ml-2",
              currentTourStep.placement === 'left' && "right-0 top-1/2 -mr-2 -mt-2"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
};