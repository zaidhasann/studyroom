import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (name) => apiClient.put('/auth/profile', { name }),
};

// Room API calls
export const roomAPI = {
  createRoom: (roomName, description, category, maxMembers, password) =>
    apiClient.post('/rooms', { roomName, description, category, maxMembers, password }),
  getRooms: () => apiClient.get('/rooms'),
  getRoomById: (id) => apiClient.get(`/rooms/${id}`),
  updateRoom: (id, roomName, description, category, maxMembers, password) =>
    apiClient.put(`/rooms/${id}`, { roomName, description, category, maxMembers, password }),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}`),
  joinRoom: (roomCode, password) => apiClient.post('/rooms/join-room', { roomCode, password }),
  leaveRoom: (id) => apiClient.post(`/rooms/${id}/leave`),
  getUserRooms: () => apiClient.get('/rooms/user/my-rooms'),
  removeMember: (roomId, memberId) => apiClient.post('/rooms/remove-member', { roomId, memberId }),
  uploadFile: (roomId, file, fileType, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('description', description);
    return apiClient.post(`/rooms/${roomId}/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFiles: (roomId) => apiClient.get(`/rooms/${roomId}/files`),
  deleteFile: (fileId) => apiClient.delete(`/rooms/files/${fileId}`),
};

// Session API calls
export const sessionAPI = {
  startSession: (roomId) =>
    apiClient.post('/sessions/start', { roomId }),
  pauseSession: (sessionId) =>
    apiClient.post('/sessions/pause', { sessionId }),
  resumeSession: (sessionId) =>
    apiClient.post('/sessions/resume', { sessionId }),
  endSession: (sessionId) =>
    apiClient.post('/sessions/end', { sessionId }),
  getSessionHistory: (roomId) =>
    apiClient.get(`/sessions/history/${roomId}`),
  addParticipantToSession: (sessionId) =>
    apiClient.post(`/sessions/${sessionId}/add-participant`),
};

// Message API calls
export const messageAPI = {
  getMessages: (roomId, limit = 50) =>
    apiClient.get(`/messages/${roomId}?limit=${limit}`),
  deleteMessage: (messageId) =>
    apiClient.delete(`/messages/${messageId}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  getUserActivity: () => apiClient.get('/dashboard/activity'),
};

export default apiClient;
