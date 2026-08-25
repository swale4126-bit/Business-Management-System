import api from './api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data?.data || response.data;
  },
  getCharts: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data?.data || response.data;
  }
};

export default dashboardService;
