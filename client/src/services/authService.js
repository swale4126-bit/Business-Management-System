import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  demoLogin: async () => {
    const response = await api.post('/auth/demo-login');
    return response.data;
  },
  logout: async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const response = await api.post('/auth/logout', { token: refreshToken });
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};

export default authService;
