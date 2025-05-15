import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

// Define interfaces for data types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  // ...other fields as needed
}

interface Appointment {
  id: string;
  patientId: string;
  userId: string;
  date: string;
  status: string;
  notes?: string;
  patientName?: string; // For display purposes
  type?: string; // Appointment type
}

interface Message {
  id: string;
  patientId: string;
  userId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

interface DashboardSummary {
  totalPatients: number;
  activePatients?: number;
  totalAppointments: number;
  sessionsToday?: number;
  totalMessages: number;
  unreadMessages?: number;
  nextAppointment?: Appointment;
}

// Dashboard section type for customization
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

// Filter options for dashboard data
interface DashboardFilters {
  appointments: {
    dateRange: { start: Date | null; end: Date | null };
    status: string | null;
    patientId: string | null;
    searchQuery: string;
  };
  patients: {
    status: string | null;
    searchQuery: string;
  };
  messages: {
    read: boolean | null;
    searchQuery: string;
  };
}

// Interface for the dashboard store
interface DashboardStore {
  // User and data state
  userId: string;
  selectedPatientId: string | null;
  dashboardSummary: DashboardSummary | null;
  patients: Patient[];
  appointments: Appointment[];
  messages: Message[];

  // Socket for real-time updates
  socket: Socket | null;
  isConnected: boolean;

  // Layout customization
  sections: DashboardSection[];

  // Filters
  filters: DashboardFilters;

  // First-time user
  isFirstTimeUser: boolean;
  hasCompletedTour: boolean;

  // Actions - User and data
  setUserId: (id: string) => void;
  setSelectedPatientId: (id: string | null) => void;
  fetchDashboardSummary: () => Promise<void>;
  fetchPatients: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchMessages: () => Promise<void>;

  // Actions - Socket
  connectSocket: () => void;
  disconnectSocket: () => void;

  // Actions - Layout customization
  updateSectionVisibility: (sectionId: SectionId, visible: boolean) => void;
  updateSectionOrder: (sectionId: SectionId, order: number) => void;
  updateSectionCollapsed: (sectionId: SectionId, collapsed: boolean) => void;
  resetLayout: () => void;

  // Actions - Filters
  updateAppointmentFilters: (filters: Partial<DashboardFilters['appointments']>) => void;
  updatePatientFilters: (filters: Partial<DashboardFilters['patients']>) => void;
  updateMessageFilters: (filters: Partial<DashboardFilters['messages']>) => void;
  resetFilters: () => void;

  // Actions - Tour
  setHasCompletedTour: (completed: boolean) => void;

  // Computed values
  getFilteredAppointments: () => Appointment[];
  getFilteredPatients: () => Patient[];
  getFilteredMessages: () => Message[];
}

// Default sections configuration
const defaultSections: DashboardSection[] = [
  { id: 'metrics', title: 'Métricas', visible: true, order: 0, collapsed: false },
  { id: 'appointments', title: 'Citas', visible: true, order: 1, collapsed: false },
  { id: 'clinicalProgress', title: 'Progreso Clínico', visible: true, order: 2, collapsed: false },
  { id: 'aiInsights', title: 'IA Insights', visible: true, order: 3, collapsed: false },
  { id: 'quickActions', title: 'Acciones Rápidas', visible: true, order: 4, collapsed: false },
];

// Default filters
const defaultFilters: DashboardFilters = {
  appointments: {
    dateRange: { start: null, end: null },
    status: null,
    patientId: null,
    searchQuery: '',
  },
  patients: {
    status: null,
    searchQuery: '',
  },
  messages: {
    read: null,
    searchQuery: '',
  },
};

// Create the store with persistence for user preferences
export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: '',
      selectedPatientId: null,
      dashboardSummary: null,
      patients: [],
      appointments: [],
      messages: [],
      socket: null,
      isConnected: false,
      sections: [...defaultSections],
      filters: { ...defaultFilters },
      isFirstTimeUser: true,
      hasCompletedTour: false,

      // Actions - User and data
      setUserId: (id) => set({ userId: id }),
      setSelectedPatientId: (id) => set({ selectedPatientId: id }),

      fetchDashboardSummary: async () => {
        const { userId } = get();
        if (!userId) {
          console.warn('No user ID available for fetching dashboard summary');
          return;
        }

        try {
          console.log('Fetching dashboard summary for user:', userId);

          const res = await fetch(`/api/dashboard/summary`, {
            credentials: 'include',
            cache: 'no-store', // Ensure fresh data
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            // Don't throw, just log and continue
            if (res.status !== 401) { // Don't log auth errors
              console.warn(`Failed to fetch dashboard summary: ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          console.log('Dashboard summary data received:', data);
          set({ dashboardSummary: data });
        } catch (error) {
          console.warn('Error fetching dashboard summary:', error);
          // Don't update state on error
        }
      },

      fetchPatients: async () => {
        const { userId } = get();
        if (!userId) {
          console.warn('No user ID available for fetching patients');
          return;
        }

        try {
          const res = await fetch(`/api/patients?userId=${userId}`, {
            credentials: 'same-origin'
          });

          if (!res.ok) {
            // Don't throw, just log and continue
            if (res.status !== 401) { // Don't log auth errors
              console.warn(`Failed to fetch patients: ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          set({ patients: Array.isArray(data) ? data : (data.items || data.patients || []) });
        } catch (error) {
          console.warn('Error fetching patients:', error);
          // Don't update state on error
        }
      },

      fetchAppointments: async () => {
        const { userId } = get();
        if (!userId) {
          console.warn('No user ID available for fetching appointments');
          return;
        }

        try {
          const res = await fetch(`/api/appointments?userId=${userId}`, {
            credentials: 'same-origin'
          });

          if (!res.ok) {
            // Don't throw, just log and continue
            if (res.status !== 401) { // Don't log auth errors
              console.warn(`Failed to fetch appointments: ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          set({ appointments: Array.isArray(data) ? data : (data.items || []) });
        } catch (error) {
          console.warn('Error fetching appointments:', error);
          // Don't update state on error
        }
      },

      fetchMessages: async () => {
        const { userId } = get();
        if (!userId) {
          console.warn('No user ID available for fetching messages');
          return;
        }

        try {
          const res = await fetch(`/api/messages?userId=${userId}`, {
            credentials: 'same-origin'
          });

          if (!res.ok) {
            // Don't throw, just log and continue
            if (res.status !== 401) { // Don't log auth errors
              console.warn(`Failed to fetch messages: ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          set({ messages: Array.isArray(data) ? data : (data.items || []) });
        } catch (error) {
          console.warn('Error fetching messages:', error);
          // Don't update state on error
        }
      },

      // Actions - Socket
      connectSocket: () => {
        // Only connect if not already connected
        if (get().socket || get().isConnected) return;

        // Check if userId is available
        const { userId } = get();
        if (!userId) {
          console.warn('Cannot connect socket: No user ID available');
          return;
        }

        try {
          console.log('Initializing socket connection');

          // Use a timeout to delay socket connection to avoid blocking dashboard loading
          setTimeout(() => {
            // Check again if socket is already connected (could have happened during the timeout)
            if (get().socket || get().isConnected) return;

            const socket = io({
              path: '/api/socket',
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              timeout: 10000,
              // Add transports configuration to prefer WebSocket
              transports: ['websocket', 'polling'],
              // Add additional options to improve performance
              forceNew: false,
              reconnection: true,
              autoConnect: true,
            });

            socket.on('connect', () => {
              set({ isConnected: true });
              console.log('Socket connected');

              // Subscribe to updates for the current user
              socket.emit('subscribe', { userId });
            });

            socket.on('connect_error', (error) => {
              console.warn('Socket connection error:', error);
              // Don't set isConnected to false here, let the disconnect event handle it
            });

            socket.on('disconnect', () => {
              set({ isConnected: false });
              console.log('Socket disconnected');
            });

            // Listen for data updates with debouncing to prevent excessive refreshes
            let dashboardUpdateTimeout: NodeJS.Timeout | null = null;
            socket.on('dashboard:update', () => {
              // Debounce dashboard updates
              if (dashboardUpdateTimeout) clearTimeout(dashboardUpdateTimeout);
              dashboardUpdateTimeout = setTimeout(() => {
                console.log('Received dashboard:update event, refreshing data');
                get().fetchDashboardSummary();
              }, 1000);
            });

            let appointmentsUpdateTimeout: NodeJS.Timeout | null = null;
            socket.on('appointments:update', () => {
              if (appointmentsUpdateTimeout) clearTimeout(appointmentsUpdateTimeout);
              appointmentsUpdateTimeout = setTimeout(() => {
                console.log('Received appointments:update event, refreshing data');
                get().fetchAppointments();
              }, 1000);
            });

            let patientsUpdateTimeout: NodeJS.Timeout | null = null;
            socket.on('patients:update', () => {
              if (patientsUpdateTimeout) clearTimeout(patientsUpdateTimeout);
              patientsUpdateTimeout = setTimeout(() => {
                console.log('Received patients:update event, refreshing data');
                get().fetchPatients();
              }, 1000);
            });

            let messagesUpdateTimeout: NodeJS.Timeout | null = null;
            socket.on('messages:update', () => {
              if (messagesUpdateTimeout) clearTimeout(messagesUpdateTimeout);
              messagesUpdateTimeout = setTimeout(() => {
                console.log('Received messages:update event, refreshing data');
                get().fetchMessages();
              }, 1000);
            });

            set({ socket });
          }, 5000); // Delay socket connection by 5 seconds
        } catch (error) {
          console.warn('Error initializing socket connection:', error);
        }
      },

      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      // Actions - Layout customization
      updateSectionVisibility: (sectionId, visible) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, visible } : section
          ),
        }));
      },

      updateSectionOrder: (sectionId, order) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, order } : section
          ),
        }));
      },

      updateSectionCollapsed: (sectionId, collapsed) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, collapsed } : section
          ),
        }));
      },

      resetLayout: () => {
        set({ sections: [...defaultSections] });
      },

      // Actions - Filters
      updateAppointmentFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            appointments: {
              ...state.filters.appointments,
              ...filters,
            },
          },
        }));
      },

      updatePatientFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            patients: {
              ...state.filters.patients,
              ...filters,
            },
          },
        }));
      },

      updateMessageFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            messages: {
              ...state.filters.messages,
              ...filters,
            },
          },
        }));
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
      },

      // Actions - Tour
      setHasCompletedTour: (completed) => {
        set({ hasCompletedTour: completed, isFirstTimeUser: !completed });
      },

      // Computed values
      getFilteredAppointments: () => {
        const { appointments, filters } = get();
        const { dateRange, status, patientId, searchQuery } = filters.appointments;

        return appointments.filter((appointment) => {
          // Filter by date range
          if (dateRange.start && new Date(appointment.date) < dateRange.start) {
            return false;
          }
          if (dateRange.end && new Date(appointment.date) > dateRange.end) {
            return false;
          }

          // Filter by status
          if (status && appointment.status !== status) {
            return false;
          }

          // Filter by patient
          if (patientId && appointment.patientId !== patientId) {
            return false;
          }

          // Filter by search query
          if (searchQuery && !appointment.patientName?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }

          return true;
        });
      },

      getFilteredPatients: () => {
        const { patients, filters } = get();
        const { status, searchQuery } = filters.patients;

        return patients.filter((patient) => {
          // Filter by status if implemented
          if (status) {
            // Implement status filtering logic if needed
          }

          // Filter by search query
          if (
            searchQuery &&
            !`${patient.firstName} ${patient.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) {
            return false;
          }

          return true;
        });
      },

      getFilteredMessages: () => {
        const { messages, filters } = get();
        const { read, searchQuery } = filters.messages;

        return messages.filter((message) => {
          // Filter by read status
          if (read !== null && message.read !== read) {
            return false;
          }

          // Filter by search query
          if (searchQuery && !message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }

          return true;
        });
      },
    }),
    {
      name: 'dashboard-storage',
      // Only persist user preferences, not the data
      partialize: (state) => ({
        sections: state.sections,
        hasCompletedTour: state.hasCompletedTour,
        isFirstTimeUser: state.isFirstTimeUser,
      }),
    }
  )
);