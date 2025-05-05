'use client';

import React from 'react';
import { Download, FileText, FileSpreadsheet, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExportDataProps {
  data: any[];
  type: 'metrics' | 'appointments' | 'patients' | 'messages' | 'reports';
  filename?: string;
  className?: string;
}

export const ExportData: React.FC<ExportDataProps> = ({
  data,
  type,
  filename,
  className,
}) => {
  // Generate default filename if not provided
  const defaultFilename = `${type}-${format(new Date(), 'yyyy-MM-dd')}`;
  const exportFilename = filename || defaultFilename;
  
  // Convert data to CSV format
  const convertToCSV = (data: any[]): string => {
    if (!data || !data.length) return '';
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const headerRow = headers.join(',');
    
    // Create CSV data rows
    const rows = data.map(item => {
      return headers.map(header => {
        // Handle special cases like dates, objects, etc.
        const value = item[header];
        
        if (value === null || value === undefined) {
          return '';
        }
        
        if (typeof value === 'object') {
          if (value instanceof Date) {
            return format(value, 'yyyy-MM-dd HH:mm:ss');
          }
          return JSON.stringify(value).replace(/"/g, '""');
        }
        
        // Escape quotes and wrap in quotes if the value contains commas or quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',');
    });
    
    // Combine header and rows
    return [headerRow, ...rows].join('\n');
  };
  
  // Export data as CSV
  const exportCSV = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFilename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export data as PDF
  const exportPDF = () => {
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // For this example, we'll just show an alert
    alert('PDF export functionality would be implemented here using a library like jsPDF');
    
    // Example implementation with jsPDF would look like:
    /*
    import { jsPDF } from 'jspdf';
    import 'jspdf-autotable';
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30);
    
    // Get headers and data for the table
    const headers = Object.keys(data[0]);
    const rows = data.map(item => Object.values(item));
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
    
    // Save the PDF
    doc.save(`${exportFilename}.pdf`);
    */
  };
  
  // Share data (e.g., via email)
  const shareData = () => {
    // In a real implementation, you might open a modal to share via email
    // or integrate with the Web Share API if supported
    alert('Share functionality would be implemented here');
    
    // Example with Web Share API:
    /*
    if (navigator.share) {
      navigator.share({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Data`,
        text: `Here is the ${type} data from the dashboard.`,
        // You would need to create a shareable URL or file here
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Web Share API not supported in this browser');
    }
    */
  };
  
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                aria-label="Export data options"
              >
                <Download size={16} />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Export data</TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={shareData}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};