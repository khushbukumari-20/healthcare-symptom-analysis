import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ML_API_BASE_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/me/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
};

export const assessmentAPI = {
  getSymptoms: () => api.get('/assessments/symptoms/'),
  createAssessment: (data) => api.post('/assessments/', data),
  getAssessments: () => api.get('/assessments/'),
  getAssessment: (id) => api.get(`/assessments/${id}/`),
  getResults: (id) => api.get(`/assessments/${id}/results/`),
  submitAssessment: (id) => api.post(`/assessments/${id}/submit/`),
  getHistory: () => api.get('/assessments/history/'),
  getPredictions: (id) => api.get(`/assessments/${id}/predictions/`),
};

// Medications - at /api/users/medications/
export const medicationAPI = {
  getAll: () => api.get('/users/medications/'),
  getById: (id) => api.get(`/users/medications/${id}/`),
  create: (data) => api.post('/users/medications/', data),
  update: (id, data) => api.put(`/users/medications/${id}/`, data),
  remove: (id) => api.delete(`/users/medications/${id}/`),
};

// ✅ FIXED: Full CRUD + assessment dropdown support
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations/'),
  getById: (id) => api.get(`/recommendations/${id}/`),
  create: (data) => api.post('/recommendations/', data),
  update: (id, data) => api.put(`/recommendations/${id}/`, data),
  remove: (id) => api.delete(`/recommendations/${id}/`),
  getDoctorSuggestions: (id) => api.get(`/recommendations/${id}/doctor_suggestions/`),
};

// Doctors
export const doctorAPI = {
  getAll: () => api.get('/users/doctors/'),
  getPatients: () => api.get('/users/doctors/my-patients/'),
  getCurrentDoctor: () => api.get('/users/me/doctor/'),
  updateMe: (data) => api.patch('/doctor-profile/me/', data),
  getMe: () => api.get('/doctor-profile/me/'),

};

// ✅ NEW: Patients list (for doctor's medication/recommendation forms)
export const patientAPI = {
  getAll: () => api.get('/users/patients/'),
};

export const doctorProfileAPI = {
  getMe: () => api.get('/users/doctor-profile/me/'),
  updateMe: (data) => api.patch('/users/doctor-profile/me/', data),
};

// ✅ NEW: Doctor Suggestions — supports file upload via FormData
export const doctorSuggestionAPI = {
  // GET  /api/doctor-suggestions/
  getAll: () => api.get('/recommendations/doctor-suggestions/'),

  // GET  /api/doctor-suggestions/{id}/
  getOne: (id) => api.get(`/recommendations/doctor-suggestions/${id}/`),

  // POST /api/doctor-suggestions/  — FormData (multipart for file upload)
  create: (formData, config = {}) =>
    api.post('/recommendations/doctor-suggestions/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    }),

  // PATCH /api/doctor-suggestions/{id}/
  update: (id, formData, config = {}) =>
    api.patch(`/recommendations/doctor-suggestions/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    }),

  // DELETE /api/doctor-suggestions/{id}/
  remove: (id) => api.delete(`/recommendations/doctor-suggestions/${id}/`),
};

export const notificationAPI = {
    getAll:       () => api.get('/notifications/'),
    getUnreadCount: () => api.get('/notifications/unread_count/'),
    markRead:     (id) => api.patch(`/notifications/${id}/mark_read/`),
    markAllRead:  () => api.patch('/notifications/mark_all_read/'),
    delete:       (id) => api.delete(`/notifications/${id}/`),
};

export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments/', data),
  getAppointments: () => api.get('/appointments/'),
  getAppointment: (id) => api.get(`/appointments/${id}/`),
  getUpcoming: () => api.get('/appointments/upcoming/'),
  getPast: () => api.get('/appointments/past/'),
  confirmAppointment: (id) => api.post(`/appointments/${id}/confirm/`),
  cancelAppointment: (id) => api.post(`/appointments/${id}/cancel/`),
  completeAppointment: (id) => api.post(`/appointments/${id}/complete/`),
};

export const symptomsAPI = {
  getSymptoms: () => api.get('/symptoms/assessments/symptoms/'),
  getDiseases: () => api.get('/symptoms/assessments/diseases/'),
  getDiseaseDetail: (name) => api.get(`/symptoms/assessments/disease/${name}/`),
  predictDisease: (data) => api.post('/symptoms/assessments/predict/', data),
  createAssessment: (data) => api.post('/symptoms/assessments/', data),
  getAssessmentHistory: () => api.get('/symptoms/assessments/'),
  getAssessment: (id) => api.get(`/symptoms/assessments/${id}/`),
  deleteAssessment: (id) => api.delete(`/symptoms/assessments/${id}/`),
};

export const chatAPI = {
  chat: (message, history = []) =>
    mlApi.post('/chat/', { message, history }),

  // NEW: Patient chat with file upload
  chatWithFile: async (message, file) => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('file', file);

    const response = await mlApi.post('/chat-with-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Predict disease from symptoms
  predict: async (symptoms, topN = 5) => {
    const response = await mlApi.post('/predict', {
      symptoms,
      top_n: topN,
    });
    return response;
  },

  // Get all symptoms
  getSymptoms: async () => {
    const response = await mlApi.get('/symptoms');
    return response;
  },

  // Get all diseases
  getDiseases: async () => {
    const response = await mlApi.get('/diseases');
    return response;
  },

  // Get single disease info
  getDisease: async (name) => {
    const response = await mlApi.get(`/disease/${name}`);
    return response;
  },

  // Health check
  healthCheck: async () => {
    const response = await mlApi.get('/health');
    return response;
  },
};

export const doctorChatAPI = {
  chat: (message, history = [], extra = {}) =>
    mlApi.post('/doctor/chat/', {
      message,
      history,
      ...extra,
    }),

  chatWithFile: (formData) =>
    mlApi.post('/doctor/chat-with-file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const medicalHistoryAPI = {
  getAll: () => api.get('/users/medical-history/'),
  create: (data) => api.post('/users/medical-history/', data),
  update: (id, data) => api.put(`/users/medical-history/${id}/`, data),
  remove: (id) => api.delete(`/users/medical-history/${id}/`),
};

export const allergyAPI = {
  getAll: () => api.get('/users/allergies/'),
  create: (data) => api.post('/users/allergies/', data),
  update: (id, data) => api.put(`/users/allergies/${id}/`, data),
  remove: (id) => api.delete(`/users/allergies/${id}/`),
};

export default api;