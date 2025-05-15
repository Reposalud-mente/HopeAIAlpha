'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import {
  AppointmentNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  checkUpcomingAppointments
} from '@/lib/notification-service';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [open, setOpen] = useState(false);

  // Get notifications on mount and when user changes
  useEffect(() => {
    if (!user?.id) return;

    // Initial load
    setNotifications(getNotifications());

    // Use a timeout to delay the initial check to avoid blocking dashboard loading
    const initialCheckTimeout = setTimeout(() => {
      console.log('Running delayed initial notification check');
      checkUpcomingAppointments(user.id);
    }, 10000); // Delay by 10 seconds after component mount

    // Set up interval to check for upcoming appointments (every 30 minutes)
    const intervalId = setInterval(() => {
      console.log('Running scheduled notification check');
      checkUpcomingAppointments(user.id);
      setNotifications(getNotifications());
    }, 30 * 60 * 1000); // Check every 30 minutes instead of 15

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [user?.id]);

  // Update notifications when popover opens
  useEffect(() => {
    if (open) {
      setNotifications(getNotifications());
    }
  }, [open]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle marking a notification as read
  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    setNotifications(getNotifications());
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between pb-2">
          <h4 className="font-medium">Notificaciones</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    notification.read ? 'bg-background' : 'bg-muted/50'
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{notification.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        notification.type === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        notification.type === 'reminder' ? 'bg-green-50 text-green-700 border-green-200' :
                        notification.type === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {notification.type === 'upcoming' ? 'Próxima' :
                       notification.type === 'reminder' ? 'Recordatorio' :
                       notification.type === 'cancelled' ? 'Cancelada' : 'Reprogramada'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}