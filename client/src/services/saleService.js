import api from './api';

const saleService = {
  getAll: async (params) => {
    const response = await api.get('/sales', { params });
    return response.data?.data ?? response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  }
};

export default saleService;
