const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('urcure_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('urcure_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('urcure_token');
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  registerPatient: (patientData: any) =>
    fetchWithAuth('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),

  registerDoctor: (doctorData: any) =>
    fetchWithAuth('/auth/register/doctor', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),

  getCurrentUser: () => fetchWithAuth('/auth/me'),

  updateProfile: (profileData: any) =>
    fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Doctors
  getDoctors: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });
    const qs = params.toString();
    return fetchWithAuth(`/doctors${qs ? `?${qs}` : ''}`);
  },

  getDoctorProfile: (doctorId: number) => fetchWithAuth(`/doctors/${doctorId}`),

  getDoctorSlots: (doctorId: number, date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchWithAuth(`/doctors/${doctorId}/slots${query}`);
  },

  updateDoctorAvailability: (doctorId: number, schedules: any[]) =>
    fetchWithAuth(`/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ schedules }),
    }),

  getDoctorDashboardStats: () => fetchWithAuth('/doctors/dashboard/stats'),

  // Appointments
  bookAppointment: (bookingData: {
    doctor_id: number;
    appointment_date: string;
    start_time: string;
    consultation_mode: 'online' | 'offline';
    reason?: string;
    notes?: string;
  }) =>
    fetchWithAuth('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  getMyAppointments: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchWithAuth(`/appointments/my${query}`);
  },

  getAppointmentByRef: (reference: string) => fetchWithAuth(`/appointments/${reference}`),

  cancelAppointment: (appointmentId: number, reason?: string) =>
    fetchWithAuth(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  rescheduleAppointment: (appointmentId: number, newDate: string, newStartTime: string) =>
    fetchWithAuth(`/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({
        appointment_date: newDate,
        start_time: newStartTime,
      }),
    }),

  // Assessments
  getInstruments: () => fetchWithAuth('/assessments/instruments'),

  submitAssessment: (data: {
    instrument_type: string;
    answers: Array<{
      question_id: string;
      question_text: string;
      selected_option: string;
      score_value: number;
    }>;
  }) =>
    fetchWithAuth('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAssessmentHistory: () => fetchWithAuth('/assessments/history'),

  recordMoodCheckin: (data: {
    mood_score: number;
    energy_score: number;
    sleep_hours: number;
    note?: string;
  }) =>
    fetchWithAuth('/assessments/mood-checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // urCure AI
  chatWithAI: (message: string) =>
    fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Consultations & Health Records
  getConsultationDetails: (appointmentId: number) =>
    fetchWithAuth(`/consultations/${appointmentId}`),

  completeConsultation: (appointmentId: number, notesData: any) =>
    fetchWithAuth(`/consultations/${appointmentId}/complete`, {
      method: 'POST',
      body: JSON.stringify(notesData),
    }),

  getClinicalRecords: () => fetchWithAuth('/consultations/records'),

  // Emergency
  getEmergencyContacts: () => fetchWithAuth('/emergency/contacts'),

  triggerEmergencySOS: (data?: { notes?: string; phone?: string }) =>
    fetchWithAuth('/emergency/trigger', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  getCrisisStatus: (crisisId: number) => fetchWithAuth(`/emergency/status/${crisisId}`),

  // Admin
  getAdminStats: () => fetchWithAuth('/admin/stats'),

  getAdminDoctors: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchWithAuth(`/admin/doctors${query}`);
  },

  toggleDoctorVerification: (doctorId: number, is_verified: boolean) =>
    fetchWithAuth(`/admin/doctors/${doctorId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ is_verified }),
    }),

  getAllAppointments: () => fetchWithAuth('/admin/appointments'),

  getAllPatients: () => fetchWithAuth('/admin/patients'),

  getCrisisEvents: () => fetchWithAuth('/admin/crisis-events'),

  resolveCrisisEvent: (eventId: number, notes?: string) =>
    fetchWithAuth(`/admin/crisis-events/${eventId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: notes }),
    }),

  getAuditLogs: () => fetchWithAuth('/admin/audit-logs'),
};
