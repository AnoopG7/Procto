import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyIdentity: (formData) => api.post('/auth/verify-identity', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProfile: () => api.get('/auth/profile'),
};

// Exam API
export const examAPI = {
  getAllExams: () => api.get('/exams'),
  getExamById: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post('/exams', examData),
  updateExam: (id, examData) => api.put(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
};

// Exam Session API
export const examSessionAPI = {
  startSession: (examId) => api.post('/exam-sessions/start', { examId }),
  submitAnswers: (sessionId, answers) => api.put(`/exam-sessions/${sessionId}/submit`, { answers }),
  saveAnswers: (sessionId, answers) => api.put(`/exam-sessions/${sessionId}/save-answers`, { answers }),
  logProctoringEvent: (sessionId, event) => api.post(`/exam-sessions/${sessionId}/log-event`, event),
  
  // Admin/Teacher endpoints
  getAllSessions: (params = {}) => api.get('/exam-sessions', { params }),
  getLiveSessions: () => api.get('/exam-sessions/live'),
  getSessionReports: (params = {}) => api.get('/exam-sessions/reports', { params }),
  getSessionById: (sessionId) => api.get(`/exam-sessions/${sessionId}`),
  exportSessionLogs: (sessionId) => api.get(`/exam-sessions/${sessionId}/export`, {
    responseType: 'blob'
  }),
};

export default api;

