'use client';

import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    faqs: [
      {
        question: 'How do I customize my dashboard layout?',
        answer: 'You can customize your dashboard by clicking the "Customize Dashboard" button at the top of the page. From there, you can drag and drop sections to rearrange them, hide sections you don\'t need, or show hidden sections.',
      },
      {
        question: 'How do I export dashboard data?',
        answer: 'Each section of the dashboard has an export button that allows you to download data in CSV or PDF format. Click the export button (download icon) and select your preferred format.',
      },
      {
        question: 'How often is the dashboard data updated?',
        answer: 'Dashboard data is updated in real-time. Any changes made to patients, appointments, or messages will be reflected immediately on your dashboard.',
      },
      {
        question: 'Can I filter the data shown on my dashboard?',
        answer: 'Yes, you can use the filter options available in each section to narrow down the data. For example, you can filter appointments by date range, status, or patient name.',
      },
    ],
  },
  {
    id: 'appointments',
    title: 'Appointments',
    faqs: [
      {
        question: 'How do I schedule a new appointment?',
        answer: 'To schedule a new appointment, go to the Calendar page and click on the desired time slot. You can also click the "New Appointment" button and fill in the appointment details.',
      },
      {
        question: 'How do I reschedule an appointment?',
        answer: 'To reschedule an appointment, find the appointment in your dashboard or calendar, click on it, and select "Reschedule". You can then choose a new date and time.',
      },
      {
        question: 'How do I cancel an appointment?',
        answer: 'To cancel an appointment, find the appointment in your dashboard or calendar, click on it, and select "Cancel". You\'ll be asked to confirm the cancellation.',
      },
    ],
  },
  {
    id: 'patients',
    title: 'Patients',
    faqs: [
      {
        question: 'How do I add a new patient?',
        answer: 'To add a new patient, go to the Patients page and click the "Add Patient" button. Fill in the patient\'s information and click "Save".',
      },
      {
        question: 'How do I view a patient\'s history?',
        answer: 'To view a patient\'s history, go to the Patients page, find the patient in the list, and click on their name. This will take you to their profile where you can see their history, appointments, and notes.',
      },
      {
        question: 'How do I update patient information?',
        answer: 'To update patient information, go to the patient\'s profile page and click the "Edit" button. Make the necessary changes and click "Save".',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI Features',
    faqs: [
      {
        question: 'What AI features are available?',
        answer: 'The platform includes AI features such as clinical insights, documentation assistance, and treatment recommendations. These features are designed to support your clinical decision-making process.',
      },
      {
        question: 'How accurate are the AI recommendations?',
        answer: 'AI recommendations are based on clinical guidelines and research, but they should always be reviewed by a qualified healthcare professional. The AI is a tool to assist you, not replace your clinical judgment.',
      },
      {
        question: 'Is patient data secure when using AI features?',
        answer: 'Yes, all patient data is encrypted and processed securely. The AI features comply with healthcare privacy regulations and do not store patient-identifiable information.',
      },
    ],
  },
];

interface HelpSectionProps {
  className?: string;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<Record<string, boolean>>({});
  
  // Toggle FAQ expansion
  const toggleFAQ = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setExpandedFAQs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  // Filter FAQs based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return helpCategories;
    }
    
    const query = searchQuery.toLowerCase();
    
    return helpCategories.map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      ),
    })).filter((category) => category.faqs.length > 0);
  };
  
  const filteredCategories = getFilteredCategories();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center gap-1", className)}
          aria-label="Help and FAQ"
        >
          <HelpCircle size={16} />
          <span>Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Help & FAQ</DialogTitle>
          <DialogDescription>
            Find answers to common questions and learn how to use the dashboard.
          </DialogDescription>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for help..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Content */}
        <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            {helpCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-1">
            {helpCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="space-y-4">
                  {filteredCategories
                    .find((c) => c.id === category.id)
                    ?.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleFAQ(category.id, index)}
                          aria-expanded={expandedFAQs[`${category.id}-${index}`]}
                        >
                          <span className="font-medium">{faq.question}</span>
                          {expandedFAQs[`${category.id}-${index}`] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFAQs[`${category.id}-${index}`] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-4 bg-white border-t">
                                <p className="text-gray-600">{faq.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  
                  {filteredCategories.find((c) => c.id === category.id)?.faqs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Need more help? Contact support.
          </p>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <span>Documentation</span>
            <ExternalLink size={14} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};