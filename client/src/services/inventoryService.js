import api from './api';

const inventoryService = {
  getAll: async (params) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  getLowStock: async (params) => {
    const response = await api.get('/inventory/low-stock', { params });
    return response.data;
  },
  getHistory: async (productIdOrParams) => {
    const params = typeof productIdOrParams === 'string'
      ? { productId: productIdOrParams }
      : productIdOrParams;
    const response = await api.get('/inventory/history', { params });
    return response.data;
  },
  stockIn: async (data) => {
    const response = await api.post('/inventory/stock-in', data);
    return response.data;
  },
  stockOut: async (data) => {
    const response = await api.post('/inventory/stock-out', data);
    return response.data;
  },
  adjustStock: async (data) => {
    const response = await api.post('/inventory/adjust', data);
    return response.data;
  }
};

export default inventoryService;
