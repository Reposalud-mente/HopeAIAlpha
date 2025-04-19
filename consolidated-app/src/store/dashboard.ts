import { create } from 'zustand';

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
  totalAppointments: number;
  totalMessages: number;
  nextAppointment?: Appointment;
}

interface DashboardStore {
  userId: string;
  selectedPatientId: string | null;
  dashboardSummary: DashboardSummary | null;
  patients: Patient[];
  appointments: Appointment[];
  messages: Message[];
  setUserId: (id: string) => void;
  setSelectedPatientId: (id: string | null) => void;
  fetchDashboardSummary: () => Promise<void>;
  fetchPatients: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchMessages: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  userId: '',
  selectedPatientId: null,
  dashboardSummary: null,
  patients: [],
  appointments: [],
  messages: [],
  setUserId: (id) => set({ userId: id }),
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  fetchDashboardSummary: async () => {
    const { userId } = get();
    // Example: You should implement an API endpoint for summary
    const res = await fetch(`/api/dashboard/summary?userId=${userId}`, { credentials: 'same-origin' });
    set({ dashboardSummary: await res.json() });
  },
  fetchPatients: async () => {
    const { userId } = get();
    const res = await fetch(`/api/patients?userId=${userId}`, { credentials: 'same-origin' });
    const data = await res.json();
    set({ patients: Array.isArray(data) ? data : data.patients || [] });
  },
  fetchAppointments: async () => {
    const { userId } = get();
    const res = await fetch(`/api/appointments?userId=${userId}`, { credentials: 'same-origin' });
    set({ appointments: await res.json() });
  },
  fetchMessages: async () => {
    const { userId } = get();
    const res = await fetch(`/api/messages?userId=${userId}`, { credentials: 'same-origin' });
    set({ messages: await res.json() });
  },
}));
