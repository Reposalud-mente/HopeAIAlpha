'use client';

import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarStore, CalendarAppointment } from '@/store/calendar';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarComponentProps {
  appointments: CalendarAppointment[];
  isLoading?: boolean;
}

export function CalendarComponent({ appointments, isLoading = false }: CalendarComponentProps) {
  const calendarRef = useRef<any>(null);
  const {
    currentView,
    currentDate,
    setCurrentDate,
    setSelectedAppointment,
    openModal
  } = useCalendarStore();

  // Update calendar view when currentView or currentDate changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();

      // Store the current view to check if it's actually changing
      const currentCalendarView = calendarApi.view.type;
      let shouldUpdateView = false;

      // Determine the new view based on currentView state
      let newView;
      if (currentView === 'day') {
        newView = 'timeGridDay';
      } else if (currentView === 'week') {
        newView = 'timeGridWeek';
      } else {
        newView = 'dayGridMonth';
      }

      // Only change the view if it's actually different
      if (currentCalendarView !== newView) {
        calendarApi.changeView(newView);
        shouldUpdateView = true;
      }

      // Get the current displayed date from the calendar
      const currentDisplayedDate = calendarApi.getDate();

      // Check if the date has actually changed
      if (shouldUpdateView ||
          currentDate.getDate() !== currentDisplayedDate.getDate() ||
          currentDate.getMonth() !== currentDisplayedDate.getMonth() ||
          currentDate.getFullYear() !== currentDisplayedDate.getFullYear()) {
        // Use a timeout to prevent potential race conditions
        setTimeout(() => {
          calendarApi.gotoDate(currentDate);
        }, 0);
      }
    }
  }, [currentView, currentDate]);

  // Format appointments for FullCalendar
  const events = appointments.map(appointment => {
    // Determine color based on status or custom color
    let backgroundColor;
    if (appointment.colorCode) {
      backgroundColor = appointment.colorCode;
    } else {
      switch (appointment.status) {
        case 'SCHEDULED':
          backgroundColor = '#3788d8'; // Blue
          break;
        case 'COMPLETED':
          backgroundColor = '#2ca02c'; // Green
          break;
        case 'CANCELLED':
          backgroundColor = '#d62728'; // Red
          break;
        case 'NO_SHOW':
          backgroundColor = '#ff7f0e'; // Orange
          break;
        default:
          backgroundColor = '#7f7f7f'; // Gray
      }
    }

    // Create event object
    return {
      id: appointment.id,
      title: appointment.patient
        ? `${appointment.title} - ${appointment.patient.firstName} ${appointment.patient.lastName}`
        : appointment.title,
      start: new Date(appointment.date),
      end: new Date(appointment.endTime),
      backgroundColor,
      borderColor: backgroundColor,
      textColor: '#ffffff',
      extendedProps: {
        ...appointment
      }
    };
  });

  // Handle date click to create new appointment
  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date);

    // Set up a new appointment at the clicked time
    const newAppointment: Partial<CalendarAppointment> = {
      date: clickedDate,
      endTime: new Date(clickedDate.getTime() + 60 * 60 * 1000), // 1 hour later
      duration: 60,
      title: 'Nueva Consulta',
      status: 'SCHEDULED',
      isRecurring: false,
      reminderSent: false
    };

    setSelectedAppointment(newAppointment as CalendarAppointment);
    openModal();
  };

  // Handle event click to edit existing appointment
  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps;
    setSelectedAppointment(appointment);
    openModal();
  };

  // Handle navigation
  const handleDatesSet = (info: any) => {
    // Only update the date when the user navigates
    // This prevents infinite loops by avoiding updates during programmatic view changes
    if (!info.view.currentStart) return;

    // Create a new date object to avoid reference issues
    const newDate = new Date(info.view.currentStart);

    // Check if the date has actually changed to prevent unnecessary updates
    if (newDate.getDate() !== currentDate.getDate() ||
        newDate.getMonth() !== currentDate.getMonth() ||
        newDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(newDate);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={
          currentView === 'day' ? 'timeGridDay' :
          currentView === 'week' ? 'timeGridWeek' :
          'dayGridMonth'
        }
        headerToolbar={false} // We're handling the header outside
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="auto"
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        locale="es"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          list: 'Lista'
        }}
      />
    </div>
  );
}