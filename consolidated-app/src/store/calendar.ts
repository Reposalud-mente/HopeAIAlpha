import { create } from 'zustand';
import { format } from 'date-fns';
import axios from 'axios';

export interface CalendarAppointment {
  id: string;
  title: string;
  patientId: string;
  userId: string;
  date: string | Date;
  endTime: string | Date;
  duration: number;
  status: string;
  notes?: string;
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string | Date;
  parentAppointmentId?: string;
  reminderSent: boolean;
  notificationPreference?: string;
  colorCode?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  patient?: {
    firstName: string;
    lastName: string;
    contactPhone?: string;
    contactEmail: string;
  };
}

interface CalendarState {
  // State
  currentView: 'day' | 'week' | 'month' | 'list';
  currentDate: Date;
  appointments: CalendarAppointment[];
  selectedAppointment: CalendarAppointment | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;

  // Actions
  setCurrentView: (view: 'day' | 'week' | 'month' | 'list') => void;
  setCurrentDate: (date: Date) => void;
  fetchAppointments: (userId: string, start?: Date, end?: Date) => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  createAppointment: (appointment: Partial<CalendarAppointment>) => Promise<CalendarAppointment>;
  updateAppointment: (id: string, appointment: Partial<CalendarAppointment>, updateSeries?: boolean) => Promise<CalendarAppointment>;
  deleteAppointment: (id: string, deleteSeries?: boolean) => Promise<void>;
  setSelectedAppointment: (appointment: CalendarAppointment | null) => void;
  openModal: () => void;
  closeModal: () => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initial state
  currentView: 'month',
  currentDate: new Date(),
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  isDeleteModalOpen: false,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentDate: (date) => {
    const currentDate = get().currentDate;
    // Only update if the date is different (comparing just the date part, not time)
    if (date.getDate() !== currentDate.getDate() ||
        date.getMonth() !== currentDate.getMonth() ||
        date.getFullYear() !== currentDate.getFullYear()) {
      set({ currentDate: date });
    }
  },

  fetchAppointments: async (userId, start, end) => {
    set({ isLoading: true, error: null });
    try {
      let url = `/api/appointments?userId=${userId}`;

      if (start && end) {
        url += `&start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`;
      }

      const response = await axios.get(url);
      set({ appointments: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAppointmentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/appointments/${id}`);
      set({ selectedAppointment: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createAppointment: async (appointment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/appointments', appointment);
      const newAppointment = response.data;

      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
        isModalOpen: false
      }));

      return newAppointment;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAppointment: async (id, appointment, updateSeries = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/appointments/${id}`, {
        ...appointment,
        updateSeries
      });

      const updatedAppointment = response.data;

      set((state) => ({
        appointments: state.appointments.map(app =>
          app.id === id ? updatedAppointment : app
        ),
        selectedAppointment: null,
        isLoading: false,
        isModalOpen: false
      }));

      return updatedAppointment;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteAppointment: async (id, deleteSeries = false) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/appointments/${id}?deleteSeries=${deleteSeries}`);

      set((state) => ({
        appointments: state.appointments.filter(app => app.id !== id),
        selectedAppointment: null,
        isLoading: false,
        isDeleteModalOpen: false,
        isModalOpen: false
      }));
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, selectedAppointment: null }),
  openDeleteModal: () => set({ isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false })
}));