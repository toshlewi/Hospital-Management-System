import api from './api';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: (userData) => api.post('/auth/register', userData),

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  updateProfile: (userData) => api.put('/auth/profile', userData),

  changePassword: (passwordData) => api.put('/auth/password', passwordData),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export default authAPI; 