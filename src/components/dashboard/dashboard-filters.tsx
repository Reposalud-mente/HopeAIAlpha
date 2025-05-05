'use client';

import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useDashboardStore } from '@/store/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  type: 'appointments' | 'patients' | 'messages';
  className?: string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  type,
  className,
}) => {
  const {
    filters,
    updateAppointmentFilters,
    updatePatientFilters,
    updateMessageFilters,
    resetFilters,
  } = useDashboardStore();
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.appointments.dateRange.start || undefined,
    to: filters.appointments.dateRange.end || undefined,
  });
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (type === 'appointments') {
      if (filters.appointments.dateRange.start) count++;
      if (filters.appointments.dateRange.end) count++;
      if (filters.appointments.status) count++;
      if (filters.appointments.patientId) count++;
      if (filters.appointments.searchQuery) count++;
    } else if (type === 'patients') {
      if (filters.patients.status) count++;
      if (filters.patients.searchQuery) count++;
    } else if (type === 'messages') {
      if (filters.messages.read !== null) count++;
      if (filters.messages.searchQuery) count++;
    }
    
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    
    if (type === 'appointments') {
      updateAppointmentFilters({ searchQuery });
    } else if (type === 'patients') {
      updatePatientFilters({ searchQuery });
    } else if (type === 'messages') {
      updateMessageFilters({ searchQuery });
    }
  };
  
  // Handle date range selection
  const handleDateRangeSelect = (selectedDateRange: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(selectedDateRange);
    
    if (type === 'appointments') {
      updateAppointmentFilters({
        dateRange: {
          start: selectedDateRange.from || null,
          end: selectedDateRange.to || null,
        },
      });
    }
  };
  
  // Handle status selection
  const handleStatusChange = (status: string | null) => {
    if (type === 'appointments') {
      updateAppointmentFilters({ status });
    } else if (type === 'patients') {
      updatePatientFilters({ status });
    }
  };
  
  // Handle read status selection for messages
  const handleReadStatusChange = (readStatus: string | null) => {
    if (type === 'messages') {
      updateMessageFilters({
        read: readStatus === 'read' ? true : readStatus === 'unread' ? false : null,
      });
    }
  };
  
  // Reset filters
  const handleResetFilters = () => {
    resetFilters();
    setDateRange({ from: undefined, to: undefined });
    setIsFiltersOpen(false);
  };
  
  // Get current search query based on filter type
  const getCurrentSearchQuery = () => {
    if (type === 'appointments') {
      return filters.appointments.searchQuery;
    } else if (type === 'patients') {
      return filters.patients.searchQuery;
    } else if (type === 'messages') {
      return filters.messages.searchQuery;
    }
    return '';
  };
  
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${type}...`}
            className="pl-10 pr-4 py-2 w-full"
            value={getCurrentSearchQuery()}
            onChange={handleSearchChange}
          />
          {getCurrentSearchQuery() && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (type === 'appointments') {
                  updateAppointmentFilters({ searchQuery: '' });
                } else if (type === 'patients') {
                  updatePatientFilters({ searchQuery: '' });
                } else if (type === 'messages') {
                  updateMessageFilters({ searchQuery: '' });
                }
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Filter Button */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              aria-label="Filter options"
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filter {type}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  disabled={activeFilterCount === 0}
                >
                  Reset
                </Button>
              </div>
              
              {/* Date Range Filter (Appointments only) */}
              {type === 'appointments' && (
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateRange.from && !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={handleDateRangeSelect}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
              
              {/* Status Filter */}
              {(type === 'appointments' || type === 'patients') && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={
                      type === 'appointments'
                        ? filters.appointments.status || ''
                        : filters.patients.status || ''
                    }
                    onValueChange={(value) => handleStatusChange(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {type === 'appointments' ? (
                        <>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Read Status Filter (Messages only) */}
              {type === 'messages' && (
                <div className="space-y-2">
                  <Label>Read Status</Label>
                  <Select
                    value={
                      filters.messages.read === true
                        ? 'read'
                        : filters.messages.read === false
                        ? 'unread'
                        : ''
                    }
                    onValueChange={(value) => handleReadStatusChange(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select read status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Apply Filters Button */}
              <Button
                className="w-full"
                onClick={() => setIsFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {type === 'appointments' && filters.appointments.dateRange.start && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>
                {format(filters.appointments.dateRange.start, "LLL dd, y")}
                {filters.appointments.dateRange.end && 
                  ` - ${format(filters.appointments.dateRange.end, "LLL dd, y")}`}
              </span>
              <button
                onClick={() => {
                  updateAppointmentFilters({
                    dateRange: { start: null, end: null },
                  });
                  setDateRange({ from: undefined, to: undefined });
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove date filter"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {type === 'appointments' && filters.appointments.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Status: {filters.appointments.status}</span>
              <button
                onClick={() => updateAppointmentFilters({ status: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove status filter"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {type === 'patients' && filters.patients.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Status: {filters.patients.status}</span>
              <button
                onClick={() => updatePatientFilters({ status: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove status filter"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {type === 'messages' && filters.messages.read !== null && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Status: {filters.messages.read ? 'Read' : 'Unread'}</span>
              <button
                onClick={() => updateMessageFilters({ read: null })}
                className="ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Remove read status filter"
              >
                <X size={14} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};