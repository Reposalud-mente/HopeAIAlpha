import { CalendarAppointment } from '@/store/calendar';
import { toast } from '@/components/ui/use-toast';

// Types for notifications
export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  title: string;
  message: string;
  type: 'upcoming' | 'reminder' | 'cancelled' | 'rescheduled';
  timestamp: Date;
  read: boolean;
}

// In-memory storage for notifications (in a real app, this would be stored in a database)
let notifications: AppointmentNotification[] = [];

/**
 * Send an in-app notification
 */
export const sendInAppNotification = (notification: Omit<AppointmentNotification, 'id' | 'timestamp' | 'read'>) => {
  const newNotification: AppointmentNotification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date(),
    read: false,
  };
  
  notifications = [newNotification, ...notifications];
  
  // Show toast notification
  toast({
    title: notification.title,
    description: notification.message,
    duration: 5000,
  });
  
  return newNotification;
};

/**
 * Send an email notification (mock implementation)
 */
export const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string
) => {
  // In a real app, this would send an actual email
  console.log(`Sending email to ${email}:`, { subject, message });
  
  // Mock API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

/**
 * Check for upcoming appointments and send notifications
 */
export const checkUpcomingAppointments = async (userId: string) => {
  try {
    // Fetch appointments that need notifications
    const response = await fetch('/api/appointments/notifications');
    const appointments: CalendarAppointment[] = await response.json();
    
    if (!appointments.length) return;
    
    // Process each appointment
    const notifiedAppointmentIds: string[] = [];
    
    for (const appointment of appointments) {
      // Skip if not for this user
      if (appointment.userId !== userId) continue;
      
      // Send in-app notification
      sendInAppNotification({
        appointmentId: appointment.id,
        title: 'Recordatorio de cita',
        message: `Tiene una cita con ${appointment.patient?.firstName} ${appointment.patient?.lastName} mañana a las ${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'upcoming',
      });
      
      // Send email notification if configured
      if (appointment.notificationPreference === 'email' || appointment.notificationPreference === 'both') {
        if (appointment.patient?.contactEmail) {
          await sendEmailNotification(
            appointment.patient.contactEmail,
            'Recordatorio de cita',
            `Le recordamos que tiene una cita programada para mañana ${new Date(appointment.date).toLocaleString()}.`
          );
        }
      }
      
      notifiedAppointmentIds.push(appointment.id);
    }
    
    // Mark appointments as notified
    if (notifiedAppointmentIds.length > 0) {
      await fetch('/api/appointments/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentIds: notifiedAppointmentIds }),
      });
    }
  } catch (error) {
    console.error('Error checking upcoming appointments:', error);
  }
};

/**
 * Get all notifications
 */
export const getNotifications = () => {
  return [...notifications];
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = (notificationId: string) => {
  notifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true } 
      : notification
  );
  
  return getNotifications();
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = () => {
  notifications = notifications.map(notification => ({ ...notification, read: true }));
  return getNotifications();
};

/**
 * Delete a notification
 */
export const deleteNotification = (notificationId: string) => {
  notifications = notifications.filter(notification => notification.id !== notificationId);
  return getNotifications();
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  notifications = [];
  return getNotifications();
};