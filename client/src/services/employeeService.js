import api from './api';

const employeeService = {
  getAll: async (params) => {
    const response = await api.get('/employees', { params });
    // Paginated API envelope: { success, data: [...], pagination } — unwrap the array
    return response.data?.data ? response.data : { data: response.data };
  },
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

export default employeeService;
